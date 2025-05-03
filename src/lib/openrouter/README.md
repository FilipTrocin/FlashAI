# OpenRouter Service

A TypeScript service for interacting with the OpenRouter.ai API to generate educational flashcards using various AI models.

## Features

- Generate educational flashcards from text input
- Manage and validate API keys
- Handle rate limiting and budget constraints
- Cache and validate model information
- Comprehensive error handling
- Type-safe interfaces

## Installation

The service is part of the FlashAI application. No separate installation is needed.

## Configuration

The service requires the following environment variables:

```env
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_DEFAULT_MODEL=openai/gpt-4.1-nano
```

## Usage

### Basic Usage

```typescript
import { OpenRouterService } from '../lib/openrouter/service';

// Initialize the service
const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: process.env.OPENROUTER_DEFAULT_MODEL
});

// Generate flashcards
const flashcards = await service.generateFlashcards({
  sourceText: 'Your educational text here',
  desiredCount: 5
});
```

### Model Management

```typescript
// List available models
const models = await service.listModels();

// Get specific model details
const model = await service.getModel('openai/gpt-4.1-nano');
```

### Budget Management

```typescript
// Get current budget information
const budget = await service.getBudgetInfo();
console.log(`Remaining budget: $${budget.remaining}`);
```

## Error Handling

The service uses a custom `OpenRouterError` class with specific error codes:

```typescript
try {
  const flashcards = await service.generateFlashcards({
    sourceText: 'Your text here'
  });
} catch (error) {
  if (error instanceof OpenRouterError) {
    switch (error.code) {
      case OpenRouterErrorCode.RATE_LIMIT_EXCEEDED:
        // Handle rate limiting
        break;
      case OpenRouterErrorCode.BUDGET_EXCEEDED:
        // Handle budget exceeded
        break;
      // ... handle other error codes
    }
  }
}
```

## API Reference

### OpenRouterService

#### Constructor

```typescript
constructor(config: OpenRouterConfig)
```

Creates a new instance of the OpenRouter service.

Parameters:
- `config`: Configuration options
  - `apiKey`: OpenRouter API key
  - `defaultModel`: Default model identifier
  - `timeout?`: Request timeout in milliseconds (default: 30000)
  - `maxRetries?`: Maximum number of retries (default: 2)
  - `debug?`: Enable debug logging (default: false)

#### Methods

##### generateFlashcards

```typescript
async generateFlashcards(params: GenerateFlashcardsParams): Promise<Flashcard[]>
```

Generates educational flashcards from the provided text.

Parameters:
- `params`:
  - `sourceText`: Text to generate flashcards from
  - `desiredCount?`: Number of flashcards to generate (default: 5)
  - `model?`: Model to use (falls back to default)
  - `options?`: Additional model parameters

##### listModels

```typescript
async listModels(): Promise<ModelDetails[]>
```

Returns information about all available models.

##### getModel

```typescript
async getModel(modelId: string): Promise<ModelDetails>
```

Returns detailed information about a specific model.

##### getBudgetInfo

```typescript
async getBudgetInfo(): Promise<BudgetInfo>
```

Returns current budget information.

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_API_KEY` | API key is not provided |
| `INVALID_API_KEY` | API key is invalid |
| `INVALID_REQUEST` | Request parameters are invalid |
| `MODEL_UNAVAILABLE` | Requested model is not available |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `BUDGET_EXCEEDED` | Budget limit exceeded |
| `TIMEOUT` | Request timed out |
| `CONTENT_POLICY_VIOLATION` | Content violates policies |
| `INVALID_RESPONSE` | Invalid response from API |
| `NETWORK_ERROR` | Network communication error |
| `UNEXPECTED_ERROR` | Unexpected error occurred |

## Testing

The service includes comprehensive tests using Vitest. Run tests with:

```bash
bun test
```

## Contributing

When contributing to this service:

1. Follow the TypeScript coding style
2. Add/update tests for any new functionality
3. Update documentation as needed
4. Follow error handling patterns
5. Use type-safe interfaces

## License

This service is part of the FlashAI application and is subject to its licensing terms. 