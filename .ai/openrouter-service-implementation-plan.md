# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service will act as a client for the OpenRouter.ai API, providing a consistent interface for FlashAI to generate educational flashcards from user-provided text. This service will handle all communication with various LLM models through OpenRouter.ai, including constructing appropriate requests with system messages, user messages, and structured response formats.

The service will be responsible for:
- Authenticating with the OpenRouter API
- Constructing properly formatted requests
- Selecting appropriate AI models based on requirements
- Managing rate limits and budget constraints
- Handling error scenarios gracefully
- Processing and validating responses
- Supporting structured JSON responses for flashcard generation

## 2. Constructor

```typescript
/**
 * Creates a new OpenRouterService to interact with the OpenRouter.ai API
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.apiKey - OpenRouter API key
 * @param {string} config.defaultModel - Default model identifier to use (e.g., 'openai/gpt-4.1-nano')
 * @param {number} config.timeout - Request timeout in milliseconds (default: 30000ms)
 * @param {number} config.maxRetries - Maximum number of retries for failed requests (default: 2)
 * @param {boolean} config.debug - Whether to enable debug logging (default: false)
 */
constructor(config: OpenRouterConfig) {
  // Implementation details
}
```

## 3. Public Methods and Fields

### 3.1 Flashcard Generation

```typescript
/**
 * Generates flashcards from the provided text
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.sourceText - Text from which to generate flashcards
 * @param {number} params.desiredCount - Number of flashcards to generate (default: 5)
 * @param {string} params.model - Model to use (optional, falls back to default model)
 * @param {Object} params.options - Additional model parameters (temperature, etc.)
 * 
 * @returns {Promise<Array<{question: string, answer: string}>>} - Array of generated flashcards
 * @throws {OpenRouterError} - If the request fails
 */
async generateFlashcards(params: GenerateFlashcardsParams): Promise<Flashcard[]> {
  // Implementation details
}
```

### 3.2 Configuration Management

```typescript
/**
 * Updates the service configuration
 * 
 * @param {Partial<OpenRouterConfig>} config - New configuration options
 */
updateConfig(config: Partial<OpenRouterConfig>): void {
  // Implementation details
}

/**
 * Gets the current service configuration
 * 
 * @returns {OpenRouterConfig} - Current configuration
 */
getConfig(): OpenRouterConfig {
  // Implementation details
}
```

### 3.3 Model Management

```typescript
/**
 * Sets the default model to use for requests
 * 
 * @param {string} modelId - Model identifier (e.g., 'openai/gpt-4.1-nano')
 */
setDefaultModel(modelId: string): void {
  // Implementation details
}

/**
 * Gets information about available models
 * 
 * @returns {Promise<Model[]>} - Array of available models with capabilities
 */
async listModels(): Promise<Model[]> {
  // Implementation details
}
```

### 3.4 Usage Tracking

```typescript
/**
 * Gets the current usage statistics
 * 
 * @returns {Promise<UsageStats>} - Usage statistics
 */
async getUsageStats(): Promise<UsageStats> {
  // Implementation details
}

/**
 * Resets the usage counters
 */
resetUsageCounters(): void {
  // Implementation details
}
```

## 4. Private Methods and Fields

### 4.1 Request Construction

```typescript
/**
 * Constructs a request payload for the OpenRouter API
 * 
 * @param {Object} params - Request parameters
 * @param {string} params.model - Model to use
 * @param {string} params.systemMessage - System message
 * @param {string} params.userMessage - User message
 * @param {Object} params.responseFormat - Response format specification (optional)
 * @param {Object} params.options - Additional model parameters
 * 
 * @returns {Object} - Formatted request payload
 * @private
 */
private constructRequestPayload(params: RequestParams): any {
  // Implementation details
}
```

### 4.2 Response Handling

```typescript
/**
 * Processes and validates the response from OpenRouter API
 * 
 * @param {Object} response - API response
 * @returns {any} - Processed response data
 * @throws {OpenRouterError} - If response is invalid
 * @private
 */
private processResponse(response: any): any {
  // Implementation details
}
```

### 4.3 Error Handling

```typescript
/**
 * Handles errors from the OpenRouter API
 * 
 * @param {Error} error - Original error
 * @returns {OpenRouterError} - Processed error with additional context
 * @private
 */
private handleError(error: Error): OpenRouterError {
  // Implementation details
}
```

### 4.4 Rate Limiting

```typescript
/**
 * Applies rate limiting based on configuration
 * 
 * @returns {Promise<void>} - Resolves when request can proceed
 * @private
 */
private async applyRateLimit(): Promise<void> {
  // Implementation details
}
```

## 5. Error Handling

The service will use a custom `OpenRouterError` class that extends the standard `Error` class to provide more context about failures:

```typescript
export class OpenRouterError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: any;
  public readonly retryable: boolean;

  constructor(message: string, options: {
    code: string;
    statusCode?: number;
    context?: any;
    retryable?: boolean;
  }) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.retryable = options.retryable ?? false;
  }
}
```

The service will handle the following error scenarios:

1. **Authentication Errors**: Invalid API key or authentication failures
2. **Request Validation Errors**: Malformed requests or invalid parameters
3. **Model Availability Errors**: Selected model is not available
4. **Rate Limiting Errors**: API rate limits exceeded
5. **Budget Exceeded Errors**: Usage beyond configured budget limits
6. **Timeout Errors**: Request took too long to complete
7. **Content Policy Violations**: Content flagged as violating acceptable use policies
8. **Malformed Response Errors**: Unexpected or invalid response format
9. **Network Errors**: Connectivity issues
10. **Unexpected Errors**: Any other unforeseen errors

Each error will be categorized with a specific error code, and information about whether the operation is retryable.

## 6. Security Considerations

1. **API Key Management**:
   - API keys will be taken from the `.env` file
   - Keys will be loaded to the environment variables

2. **Request/Response Sanitization**:
   - All user input will be validated before sending to the API
   - Responses will be sanitized to prevent security issues

3. **Rate Limiting**:
   - Implement client-side rate limiting to prevent abuse
   - Respect server-side rate limits from OpenRouter

4. **Budget Controls**:
   - Support for reading maximum budget limits the user set in the UI
   - Tracking of usage costs
   - Automatic disabling when budget thresholds are reached

5. **Logging and Monitoring**:
   - Sensitive information will be redacted from logs
   - Usage patterns will be monitored for anomalies

## 7. Implementation Plan

### 7.1 Prerequisites

1. Install required dependencies:
   ```bash
   bun add node-fetch@2 @supabase/supabase-js zod
   ```

### 7.2 File Structure

Create the following files:
- `src/lib/openrouter/index.ts` - Main export file
- `src/lib/openrouter/types.ts` - Type definitions
- `src/lib/openrouter/client.ts` - Core API client
- `src/lib/openrouter/error.ts` - Error handling
- `src/lib/openrouter/utils.ts` - Utility functions

### 7.3 Implementation Steps

1. **Create Basic Types and Interfaces**:
   - Define types for configuration, requests, responses
   - Create error classes

2. **Implement Core API Client**:
   - Build basic fetch wrapper
   - Add authentication
   - Implement request/response handling

3. **Add Flashcard Generation Logic**:
   - Define system message for flashcard generation
   - Set up JSON response schema
   - Implement validation for responses

4. **Add Error Handling**:
   - Implement comprehensive error classification
   - Add retry logic for transient failures

5. **Implement Rate Limiting and reading the bugdet that is left
   - Add usage tracking
   - Implement configurable rate limiting

6. **Create Integration with API Endpoint**:
   - Update `src/pages/api/flashcards/generate/ai.ts` to use the service
   - Replace mock implementation with real service

7. **Add Testing**:
   - Create unit tests for core functionality
   - Add integration tests for API endpoint

### 7.4 Detailed Implementation

#### 7.4.1 Core Client

```typescript
// src/lib/openrouter/client.ts
import fetch from 'node-fetch';
import { OpenRouterConfig, RequestParams } from './types';
import { OpenRouterError } from './error';

export class OpenRouterClient {
  private config: OpenRouterConfig;
  private baseUrl = 'https://openrouter.ai/api/v1';
  
  constructor(config: OpenRouterConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 2,
      debug: false,
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new OpenRouterError('API key is required', {
        code: 'missing_api_key',
        retryable: false
      });
    }
  }
  
  async sendRequest<T>(endpoint: string, params: any, options: RequestOptions = {}): Promise<T> {
    // Implementation with retry logic
  }
  
  // Other methods
}
```

#### 7.4.2 Flashcard Generation Implementation

The main service file will implement the flashcard generation logic:

```typescript
// src/lib/openrouter/index.ts
import { OpenRouterClient } from './client';
import { 
  OpenRouterConfig, 
  GenerateFlashcardsParams, 
  Flashcard 
} from './types';

export class OpenRouterService {
  private client: OpenRouterClient;
  private config: OpenRouterConfig;
  
  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.client = new OpenRouterClient(config);
  }
  
  async generateFlashcards(params: GenerateFlashcardsParams): Promise<Flashcard[]> {
    const systemMessage = `You are an AI assistant that creates educational flashcards. 
Given the source text, generate ${params.desiredCount || 5} flashcards with clear questions and comprehensive answers.
Each flashcard should focus on a key concept from the text.
Make questions concise (4-50 words) and answers informative but brief (4-200 words).`;

    const responseFormat = {
      type: 'json_schema',
      json_schema: {
        name: 'flashcards',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            flashcards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' }
                },
                required: ['question', 'answer']
              }
            }
          },
          required: ['flashcards']
        }
      }
    };
    
    const result = await this.client.sendRequest('/chat', {
      model: params.model || this.config.defaultModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: params.sourceText }
      ],
      response_format: responseFormat,
      ...params.options
    });
    
    // Process and validate response
    const flashcards = result.choices[0]?.message?.content?.flashcards;
    if (!Array.isArray(flashcards)) {
      throw new OpenRouterError('Invalid response format', {
        code: 'invalid_response',
        context: result,
        retryable: false
      });
    }
    
    // Validate each flashcard matches our requirements
    return flashcards.map(card => this.validateFlashcard(card));
  }
  
  private validateFlashcard(card: any): Flashcard {
    // Implement validation logic for question and answer
    // Check length requirements, etc.
    return card as Flashcard;
  }
  
  // Other methods
}
```

#### 7.4.3 API Endpoint Integration

Update the existing API endpoint to use the OpenRouter service:

```typescript
// src/pages/api/flashcards/generate/ai.ts
import { z } from 'zod';
import type { APIRoute } from 'astro';
import { OpenRouterService } from '../../lib/openrouter';
import type { 
  GenerateAiCardsCommand, 
  GenerateAiCardsResponse, 
  FlashcardSummaryDTO 
} from '../../../../types';

// Initialize OpenRouter service
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: 'openai/gpt-4.1-nano',
  timeout: 60000
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateAiCardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: validationResult.error.errors 
        }),
        { status: 422 }
      );
    }

    const { source_text, desired_count } = validationResult.data;
    
    // Get the authenticated user
    const { data: { user } } = await locals.supabase.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Generate flashcards using OpenRouter service
    const flashcards = await openRouterService.generateFlashcards({
      sourceText: source_text,
      desiredCount: desired_count || 5
    });
    
    // Store generated cards in database
    const { data: insertedCards, error: dbError } = await locals.supabase
      .from('flashcards')
      .insert(
        flashcards.map(card => ({
          question: card.question,
          answer: card.answer,
          user_id: user.id,
          ai_generated: true,
          ai_status: null,
          difficulty: 0
        }))
      )
      .select('id, question, answer');

    if (dbError) {
      console.error('Database error while inserting flashcards:', dbError);
      throw new Error('Failed to save flashcards to database');
    }

    // Update AI metrics
    const { error: metricsError } = await locals.supabase
      .from('ai_metrics')
      .upsert({
        user_id: user.id,
        generated_cnt: flashcards.length,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (metricsError) {
      console.error('Error updating AI metrics:', metricsError);
      // Don't throw here as cards were successfully created
    }

    const response: GenerateAiCardsResponse = {
      generated: insertedCards || []
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in /api/flashcards/generate/ai:', error);
    
    // Handle OpenRouter specific errors
    if (error.name === 'OpenRouterError') {
      if (error.code === 'rate_limit_exceeded') {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }),
          { status: 429 }
        );
      }
      
      if (error.code === 'budget_exceeded') {
        return new Response(
          JSON.stringify({ 
            error: 'Budget exceeded',
            message: 'AI usage quota exceeded.'
          }),
          { status: 429 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}
```

### 7.5 Environment Configuration

Update the environment types to include OpenRouter configuration:

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_DEFAULT_MODEL?: string;
}
```

Add these variables to the project's `.env` file:

```
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_DEFAULT_MODEL=openai/gpt-4.1-nano
