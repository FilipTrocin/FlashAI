import { z } from 'zod'
import type { APIRoute } from 'astro'
import type { GenerateAiCardsCommand, GenerateAiCardsResponse, FlashcardSummaryDTO } from '../../../../types'
import { OpenRouterService } from '../../../../lib/openrouter/service'
import { OpenRouterError, OpenRouterErrorCode } from '../../../../lib/openrouter/error'
import type { BudgetInfo } from '../../../../lib/openrouter/types'

export const prerender = false;

// Validation schema for the request body
const generateAiCardsSchema = z.object({
  source_text: z.string()
    .min(1, 'Source text cannot be empty')
    .max(10000, 'Source text is too long'), // Reasonable limit for AI processing
  desired_count: z.number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5)
})

// Initialize OpenRouter service
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4.1-nano',
  timeout: 60000,
  maxRetries: 2
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = generateAiCardsSchema.safeParse(body)
    
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
      desiredCount: desired_count,
      options: {
        temperature: 0.7,
        max_tokens: 2000
      }
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
    if (error instanceof OpenRouterError) {
      switch (error.code) {
        case OpenRouterErrorCode.RATE_LIMIT_EXCEEDED:
          return new Response(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.'
            }),
            { status: 429 }
          );
        
        case OpenRouterErrorCode.BUDGET_EXCEEDED:
          const budgetContext = error.context as Partial<BudgetInfo>;
          return new Response(
            JSON.stringify({ 
              error: 'Budget exceeded',
              message: 'AI usage quota exceeded.',
              details: {
                budget: {
                  limit: budgetContext.limit,
                  used: budgetContext.used,
                  remaining: budgetContext.remaining
                },
                resetDate: budgetContext.resetDate
              }
            }),
            { status: 402 }
          );

        case OpenRouterErrorCode.INVALID_API_KEY:
          return new Response(
            JSON.stringify({ 
              error: 'Configuration error',
              message: 'Invalid API configuration.'
            }),
            { status: 500 }
          );

        default:
          return new Response(
            JSON.stringify({ 
              error: 'AI service error',
              message: error.message
            }),
            { status: 500 }
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