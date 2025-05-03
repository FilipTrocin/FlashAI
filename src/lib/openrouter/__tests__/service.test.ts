import { test, expect, beforeEach, afterEach, mock } from 'bun:test';
import type { Mock } from 'bun:test';
import { OpenRouterService } from '../service';
import { OpenRouterError, OpenRouterErrorCode } from '../error';
import type { ModelDetails, BudgetInfo } from '../types';

test('OpenRouterService', () => {
  // Mock fetch globally
  const originalFetch = global.fetch;
  const mockFetch = mock(async () => new Response());
  
  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mockFetch.mockClear();
  });

  const mockConfig = {
    apiKey: 'test-api-key',
    defaultModel: 'openai/gpt-4.1-nano'
  };

  test('constructor', () => {
    test('should create instance with valid config', () => {
      const service = new OpenRouterService(mockConfig);
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    test('should throw error when API key is missing', () => {
      expect(() => new OpenRouterService({ ...mockConfig, apiKey: '' }))
        .toThrow(OpenRouterError);
    });

    test('should throw error for invalid model format', () => {
      expect(() => new OpenRouterService({ ...mockConfig, defaultModel: 'invalid-model' }))
        .toThrow(OpenRouterError);
    });
  });

  test('generateFlashcards', () => {
    const mockResponse = {
      flashcards: [
        { question: 'Test Question 1', answer: 'Test Answer 1' },
        { question: 'Test Question 2', answer: 'Test Answer 2' }
      ],
      usage: {
        total_tokens: 100,
        cost_usd: 0.002
      }
    };

    test('should generate flashcards successfully', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify(mockResponse),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      const result = await service.generateFlashcards({
        sourceText: 'Test text',
        desiredCount: 2
      });

      expect(result).toEqual(mockResponse.flashcards);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should handle API errors', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429 }
      ));

      const service = new OpenRouterService(mockConfig);
      await expect(service.generateFlashcards({
        sourceText: 'Test text'
      })).rejects.toThrow(OpenRouterError);
    });
  });

  test('budget management', () => {
    const mockBudgetInfo: BudgetInfo = {
      limit: 10.0,
      used: 5.0,
      remaining: 5.0,
      resetDate: new Date()
    };

    test('should fetch budget information', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({
          budget_limit: mockBudgetInfo.limit,
          budget_used: mockBudgetInfo.used,
          budget_remaining: mockBudgetInfo.remaining,
          reset_date: mockBudgetInfo.resetDate.toISOString()
        }),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      const budget = await service.getBudgetInfo();
      expect(budget).toEqual(mockBudgetInfo);
    });

    test('should cache budget information', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({
          budget_limit: mockBudgetInfo.limit,
          budget_used: mockBudgetInfo.used,
          budget_remaining: mockBudgetInfo.remaining,
          reset_date: mockBudgetInfo.resetDate.toISOString()
        }),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      await service.getBudgetInfo();
      await service.getBudgetInfo();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 6 * 60 * 1000));
      await service.getBudgetInfo();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  test('model management', () => {
    const mockModels: ModelDetails[] = [
      {
        id: 'openai/gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        description: 'Test model',
        capabilities: ['text'],
        contextWindow: {
          maxTokens: 8192,
          recommendedPromptTokens: 6144
        },
        available: true,
        features: {
          responseFormats: ['text', 'json'],
          streaming: true,
          functionCalling: false
        }
      }
    ];

    test('should list available models', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({ models: mockModels, defaultModel: mockModels[0].id }),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      const models = await service.listModels();
      expect(models).toEqual(mockModels);
    });

    test('should get specific model details', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({ models: mockModels, defaultModel: mockModels[0].id }),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      const model = await service.getModel('openai/gpt-4.1-nano');
      expect(model).toEqual(mockModels[0]);
    });

    test('should handle unavailable model', async () => {
      mockFetch.mockImplementation(async () => new Response(
        JSON.stringify({ 
          models: [{ ...mockModels[0], available: false }],
          defaultModel: mockModels[0].id
        }),
        { status: 200 }
      ));

      const service = new OpenRouterService(mockConfig);
      await expect(service.generateFlashcards({
        sourceText: 'test',
        model: 'openai/gpt-4.1-nano'
      })).rejects.toThrow(OpenRouterError);
    });
  });
}); 