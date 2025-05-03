/**
 * Error codes for OpenRouter service
 */
export enum OpenRouterErrorCode {
  MISSING_API_KEY = 'missing_api_key',
  INVALID_API_KEY = 'invalid_api_key',
  INVALID_REQUEST = 'invalid_request',
  MODEL_UNAVAILABLE = 'model_unavailable',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BUDGET_EXCEEDED = 'budget_exceeded',
  TIMEOUT = 'timeout',
  CONTENT_POLICY_VIOLATION = 'content_policy_violation',
  INVALID_RESPONSE = 'invalid_response',
  NETWORK_ERROR = 'network_error',
  UNEXPECTED_ERROR = 'unexpected_error'
}

/**
 * Custom error class for OpenRouter service
 */
export class OpenRouterError extends Error {
  public readonly code: OpenRouterErrorCode;
  public readonly statusCode?: number;
  public readonly context?: unknown;
  public readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      code: OpenRouterErrorCode;
      statusCode?: number;
      context?: unknown;
      retryable?: boolean;
    }
  ) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.retryable = options.retryable ?? false;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, OpenRouterError.prototype);
  }

  /**
   * Creates an error instance from an API response
   */
  static fromApiResponse(response: Response, body: any): OpenRouterError {
    const statusCode = response.status;
    let code: OpenRouterErrorCode;
    let message: string;
    let retryable = false;

    switch (statusCode) {
      case 401:
        code = OpenRouterErrorCode.INVALID_API_KEY;
        message = 'Invalid API key';
        break;
      case 429:
        code = OpenRouterErrorCode.RATE_LIMIT_EXCEEDED;
        message = 'Rate limit exceeded';
        retryable = true;
        break;
      case 402:
        code = OpenRouterErrorCode.BUDGET_EXCEEDED;
        message = 'Budget limit exceeded';
        break;
      case 404:
        code = OpenRouterErrorCode.MODEL_UNAVAILABLE;
        message = 'Requested model is not available';
        break;
      case 400:
        code = OpenRouterErrorCode.INVALID_REQUEST;
        message = 'Invalid request parameters';
        break;
      default:
        code = OpenRouterErrorCode.UNEXPECTED_ERROR;
        message = 'An unexpected error occurred';
        retryable = statusCode >= 500;
    }

    return new OpenRouterError(message, {
      code,
      statusCode,
      context: body,
      retryable
    });
  }

  /**
   * Creates an error instance from a network error
   */
  static fromNetworkError(error: Error): OpenRouterError {
    return new OpenRouterError(error.message, {
      code: OpenRouterErrorCode.NETWORK_ERROR,
      context: error,
      retryable: true
    });
  }

  /**
   * Creates a timeout error instance
   */
  static timeout(duration: number): OpenRouterError {
    return new OpenRouterError(`Request timed out after ${duration}ms`, {
      code: OpenRouterErrorCode.TIMEOUT,
      retryable: true
    });
  }
} 