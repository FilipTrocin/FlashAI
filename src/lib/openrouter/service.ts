import type { OpenRouterConfig, GenerateFlashcardsParams, Flashcard, Model, UsageStats, RequestParams, RequestOptions, BudgetInfo, ModelDetails, ModelListResponse } from './types';
import { OpenRouterError, OpenRouterErrorCode } from './error';

/**
 * Service for interacting with the OpenRouter.ai API
 */
export class OpenRouterService {
  private readonly config: Required<OpenRouterConfig>;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private usageStats: UsageStats = {
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    lastRequestAt: new Date()
  };

  // Rate limiting state
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // Minimum 1 second between requests
  
  // Budget tracking
  private budgetInfo?: BudgetInfo;
  private lastBudgetCheck = 0;
  private readonly budgetCheckInterval = 5 * 60 * 1000; // Check budget every 5 minutes

  // Model management
  private modelCache: Map<string, ModelDetails> = new Map();
  private lastModelsFetch = 0;
  private readonly modelsCacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Creates a new OpenRouterService instance
   */
  constructor(config: OpenRouterConfig) {
    // Validate and set default configuration
    if (!config.apiKey) {
      throw new OpenRouterError('API key is required', {
        code: OpenRouterErrorCode.MISSING_API_KEY,
        retryable: false
      });
    }

    this.config = {
      apiKey: config.apiKey,
      defaultModel: config.defaultModel,
      timeout: config.timeout ?? 30000,
      maxRetries: config.maxRetries ?? 2,
      debug: config.debug ?? false
    };

    // Validate default model format
    if (!this.isValidModelId(this.config.defaultModel)) {
      throw new OpenRouterError('Invalid default model format', {
        code: OpenRouterErrorCode.INVALID_REQUEST,
        context: { model: this.config.defaultModel },
        retryable: false
      });
    }
  }

  /**
   * Updates the service configuration
   */
  public updateConfig(config: Partial<OpenRouterConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Gets the current service configuration
   */
  public getConfig(): OpenRouterConfig {
    return { ...this.config };
  }

  /**
   * Gets the current usage statistics
   */
  public getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  /**
   * Resets the usage counters
   */
  public resetUsageCounters(): void {
    this.usageStats = {
      totalTokens: 0,
      totalCost: 0,
      requestCount: 0,
      lastRequestAt: new Date()
    };
  }

  /**
   * Validates a model identifier format
   */
  private isValidModelId(modelId: string): boolean {
    return /^[a-z-]+\/[a-z0-9.-]+$/.test(modelId);
  }

  /**
   * Fetches current budget information from OpenRouter
   */
  private async fetchBudgetInfo(): Promise<BudgetInfo> {
    const response = await fetch(`${this.baseUrl}/user/budget`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://flashai.app',
        'X-Title': 'FlashAI'
      }
    });

    if (!response.ok) {
      throw OpenRouterError.fromApiResponse(response, await response.json());
    }

    const data = await response.json();
    
    return {
      limit: data.budget_limit,
      used: data.budget_used,
      remaining: data.budget_remaining,
      resetDate: new Date(data.reset_date)
    };
  }

  /**
   * Updates budget information if needed
   */
  private async updateBudgetInfo(): Promise<void> {
    const now = Date.now();
    if (!this.budgetInfo || (now - this.lastBudgetCheck) >= this.budgetCheckInterval) {
      try {
        this.budgetInfo = await this.fetchBudgetInfo();
        this.lastBudgetCheck = now;
      } catch (error) {
        console.error('Failed to fetch budget information:', error);
        // Don't throw here - we'll use the last known budget info
        // If we don't have any budget info, the next check will throw
      }
    }
  }

  /**
   * Checks if we should proceed with the request based on rate limits and budget
   */
  private async checkRequestLimits(): Promise<void> {
    // Update budget information if needed
    await this.updateBudgetInfo();

    // Check budget limit
    if (!this.budgetInfo) {
      throw new OpenRouterError('Unable to verify budget limit', {
        code: OpenRouterErrorCode.UNEXPECTED_ERROR,
        retryable: true
      });
    }

    if (this.budgetInfo.remaining <= 0) {
      throw new OpenRouterError('Budget limit exceeded', {
        code: OpenRouterErrorCode.BUDGET_EXCEEDED,
        context: {
          limit: this.budgetInfo.limit,
          used: this.budgetInfo.used,
          remaining: this.budgetInfo.remaining,
          resetDate: this.budgetInfo.resetDate
        },
        retryable: false
      });
    }

    // Apply rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Gets the current budget information
   */
  public async getBudgetInfo(): Promise<BudgetInfo> {
    await this.updateBudgetInfo();
    if (!this.budgetInfo) {
      throw new OpenRouterError('Unable to fetch budget information', {
        code: OpenRouterErrorCode.UNEXPECTED_ERROR,
        retryable: true
      });
    }
    return { ...this.budgetInfo };
  }

  /**
   * Fetches available models from OpenRouter API
   */
  private async fetchModels(): Promise<ModelListResponse> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://flashai.app',
        'X-Title': 'FlashAI'
      }
    });

    if (!response.ok) {
      throw OpenRouterError.fromApiResponse(response, await response.json());
    }

    const data = await response.json();
    return data as ModelListResponse;
  }

  /**
   * Updates the model cache if needed
   */
  private async updateModelCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastModelsFetch >= this.modelsCacheTimeout) {
      try {
        const { models } = await this.fetchModels();
        this.modelCache.clear();
        for (const model of models) {
          this.modelCache.set(model.id, model);
        }
        this.lastModelsFetch = now;
      } catch (error) {
        console.error('Failed to update model cache:', error);
        // Don't throw here - we'll use the cached models
        // If we don't have any models cached, the next operation will throw
      }
    }
  }

  /**
   * Gets information about available models
   */
  public async listModels(): Promise<ModelDetails[]> {
    await this.updateModelCache();
    return Array.from(this.modelCache.values());
  }

  /**
   * Gets information about a specific model
   */
  public async getModel(modelId: string): Promise<ModelDetails> {
    await this.updateModelCache();
    const model = this.modelCache.get(modelId);
    if (!model) {
      throw new OpenRouterError(`Model ${modelId} not found`, {
        code: OpenRouterErrorCode.MODEL_UNAVAILABLE,
        context: { modelId },
        retryable: false
      });
    }
    return { ...model };
  }

  /**
   * Checks if a model is available and suitable for the request
   */
  private async validateModel(modelId: string, params: RequestParams): Promise<void> {
    const model = await this.getModel(modelId);

    if (!model.available) {
      throw new OpenRouterError(`Model ${modelId} is currently unavailable`, {
        code: OpenRouterErrorCode.MODEL_UNAVAILABLE,
        context: { model },
        retryable: true
      });
    }

    // Check if the model supports JSON response format if required
    if (params.responseFormat?.type === 'json_schema' && 
        !model.features.responseFormats.includes('json')) {
      throw new OpenRouterError(`Model ${modelId} does not support JSON responses`, {
        code: OpenRouterErrorCode.INVALID_REQUEST,
        context: { model, requiredFormat: 'json' },
        retryable: false
      });
    }

    // Apply model-specific rate limits if defined
    if (model.rateLimit) {
      // Implementation of model-specific rate limiting would go here
      // This would need to track usage per model
    }
  }

  /**
   * Modified sendRequest to include model validation
   */
  private async sendRequest<T>(
    endpoint: string,
    params: RequestParams,
    options: RequestOptions = {}
  ): Promise<T> {
    // Validate model before proceeding
    await this.validateModel(params.model, params);

    await this.checkRequestLimits();

    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout ?? this.config.timeout;
    const shouldRetry = options.retry ?? true;
    let attempt = 0;

    while (attempt <= (shouldRetry ? this.config.maxRetries : 0)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'HTTP-Referer': 'https://flashai.app',
              'X-Title': 'FlashAI'
            },
            body: JSON.stringify({
              model: params.model,
              messages: [
                { role: 'system', content: params.systemMessage },
                { role: 'user', content: params.userMessage }
              ],
              response_format: params.responseFormat,
              ...params.options
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const body = await response.json();

          if (!response.ok) {
            throw OpenRouterError.fromApiResponse(response, body);
          }

          // Update usage statistics
          if (body.usage) {
            this.updateUsageStats(body.usage);
          }

          return body as T;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw OpenRouterError.timeout(timeout);
          }

          if (error instanceof OpenRouterError) {
            if (!error.retryable || attempt === this.config.maxRetries) {
              throw error;
            }
          } else {
            throw OpenRouterError.fromNetworkError(error);
          }
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }

    throw new OpenRouterError('Maximum retry attempts exceeded', {
      code: OpenRouterErrorCode.UNEXPECTED_ERROR,
      retryable: false
    });
  }

  /**
   * Updates usage statistics from API response
   */
  private updateUsageStats(usage: { total_tokens: number; cost_usd: number }): void {
    this.usageStats.totalTokens += usage.total_tokens;
    this.usageStats.totalCost += usage.cost_usd;
    this.usageStats.requestCount++;
    this.usageStats.lastRequestAt = new Date();
  }

  /**
   * Generates flashcards from the provided text
   */
  public async generateFlashcards(params: GenerateFlashcardsParams): Promise<Flashcard[]> {
    const systemMessage = `You are an AI assistant that creates educational flashcards.
Given the source text, generate ${params.desiredCount || 5} flashcards with clear questions and comprehensive answers.
Each flashcard should focus on a key concept from the text.
Make questions concise (4-50 words) and answers informative but brief (4-200 words).
Ensure each flashcard covers a unique concept and avoids redundancy.
Format your response as a JSON array of objects with 'question' and 'answer' fields.`;

    const responseFormat = {
      type: 'json_schema',
      schema: {
        type: 'object',
        required: ['flashcards'],
        properties: {
          flashcards: {
            type: 'array',
            items: {
              type: 'object',
              required: ['question', 'answer'],
              properties: {
                question: { type: 'string', minLength: 4, maxLength: 50 },
                answer: { type: 'string', minLength: 4, maxLength: 200 }
              }
            }
          }
        }
      }
    };

    const response = await this.sendRequest<{ flashcards: Flashcard[] }>(
      '/chat/completions',
      {
        model: params.model ?? this.config.defaultModel,
        systemMessage,
        userMessage: params.sourceText,
        responseFormat,
        options: {
          temperature: 0.7,
          max_tokens: 2000,
          ...params.options
        }
      }
    );

    if (!Array.isArray(response.flashcards)) {
      throw new OpenRouterError('Invalid response format from API', {
        code: OpenRouterErrorCode.INVALID_RESPONSE,
        context: response,
        retryable: false
      });
    }

    // Validate each flashcard
    return response.flashcards.map((card, index) => {
      if (!this.isValidFlashcard(card)) {
        throw new OpenRouterError(`Invalid flashcard at index ${index}`, {
          code: OpenRouterErrorCode.INVALID_RESPONSE,
          context: card,
          retryable: false
        });
      }
      return card;
    });
  }

  /**
   * Validates a flashcard structure
   */
  private isValidFlashcard(card: unknown): card is Flashcard {
    if (!card || typeof card !== 'object') return false;
    
    const { question, answer } = card as Record<string, unknown>;
    
    return (
      typeof question === 'string' &&
      typeof answer === 'string' &&
      question.length >= 4 &&
      question.length <= 50 &&
      answer.length >= 4 &&
      answer.length <= 200
    );
  }
} 