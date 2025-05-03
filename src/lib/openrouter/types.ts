/**
 * Configuration options for the OpenRouter service
 */
export interface OpenRouterConfig {
  /** OpenRouter API key */
  apiKey: string;
  /** Default model identifier to use */
  defaultModel: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Parameters for generating flashcards
 */
export interface GenerateFlashcardsParams {
  /** Text from which to generate flashcards */
  sourceText: string;
  /** Number of flashcards to generate */
  desiredCount?: number;
  /** Model to use (optional, falls back to default model) */
  model?: string;
  /** Additional model parameters */
  options?: Record<string, unknown>;
}

/**
 * Generated flashcard structure
 */
export interface Flashcard {
  /** The question part of the flashcard */
  question: string;
  /** The answer part of the flashcard */
  answer: string;
}

/**
 * Model information from OpenRouter API
 */
export interface Model {
  /** Model identifier */
  id: string;
  /** Model name */
  name: string;
  /** Model description */
  description?: string;
  /** Model capabilities */
  capabilities: string[];
  /** Model pricing information */
  pricing?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Usage statistics
 */
export interface UsageStats {
  /** Total tokens used */
  totalTokens: number;
  /** Total cost in USD */
  totalCost: number;
  /** Number of requests made */
  requestCount: number;
  /** Last request timestamp */
  lastRequestAt: Date;
}

/**
 * Request parameters for OpenRouter API
 */
export interface RequestParams {
  /** Model to use */
  model: string;
  /** System message */
  systemMessage: string;
  /** User message */
  userMessage: string;
  /** Response format specification */
  responseFormat?: Record<string, unknown>;
  /** Additional model parameters */
  options?: Record<string, unknown>;
}

/**
 * Request options
 */
export interface RequestOptions {
  /** Whether to retry on failure */
  retry?: boolean;
  /** Custom timeout for this request */
  timeout?: number;
}

/**
 * Budget information from OpenRouter
 */
export interface BudgetInfo {
  /** Total budget limit in USD */
  limit: number;
  /** Current usage in USD */
  used: number;
  /** Remaining budget in USD */
  remaining: number;
  /** When the budget resets */
  resetDate: Date;
}

/**
 * Model context window size information
 */
export interface ModelContextWindow {
  /** Maximum total tokens (prompt + completion) */
  maxTokens: number;
  /** Recommended maximum prompt tokens */
  recommendedPromptTokens: number;
}

/**
 * Detailed model information from OpenRouter API
 */
export interface ModelDetails extends Model {
  /** Model context window information */
  contextWindow: ModelContextWindow;
  /** Model-specific rate limits */
  rateLimit?: {
    /** Requests per minute */
    requestsPerMinute: number;
    /** Tokens per minute */
    tokensPerMinute: number;
  };
  /** Whether the model is currently available */
  available: boolean;
  /** Model features and supported formats */
  features: {
    /** Supported response formats */
    responseFormats: string[];
    /** Whether the model supports streaming */
    streaming: boolean;
    /** Whether the model supports function calling */
    functionCalling: boolean;
  };
}

/**
 * Model list response from OpenRouter API
 */
export interface ModelListResponse {
  /** List of available models */
  models: ModelDetails[];
  /** Default model for the account */
  defaultModel: string;
} 