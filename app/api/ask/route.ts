import { NextRequest, NextResponse } from 'next/server';
import { generateRAGResponse } from '@/lib/retrieval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, gameId } = body;
    
    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { error: 'Query is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // Example authentication flow:
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Authentication required. Please sign up for access.' },
    //     { status: 401 }
    //   );
    // }
    // 
    // const token = authHeader.substring(7);
    // const user = await validateToken(token);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Invalid authentication token.' },
    //     { status: 401 }
    //   );
    // }
    //
    // if (!user.hasActiveSubscription) {
    //   return NextResponse.json(
    //     { error: 'Subscription required. Please upgrade your plan.' },
    //     { status: 402 }
    //   );
    // }

    // Check if server has OpenAI API key configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Generate RAG response using server-side API key
    const ragResponse = await generateRAGResponse(query, gameId);

    return NextResponse.json({
      success: true,
      data: ragResponse,
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);

    // Check for specific OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('credentials')) {
        return NextResponse.json(
          { 
            error: 'AI service configuration issue. Please contact support.',
            code: 'service_error'
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is temporarily busy. Please try again in a few minutes.' },
          { status: 429 }
        );
      }

      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          { 
            error: 'AI service configuration error. Please contact support.',
            code: 'service_error'
          },
          { status: 500 }
        );
      }

      // Return the actual error message for debugging (in development)
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { 
            error: `Development Error: ${error.message}`,
            stack: error.stack
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Use POST method to ask questions',
      example: {
        query: 'How do you start multiball in Attack from Mars?',
        gameId: 'optional-game-uuid',
      },
      note: 'Authentication and subscription required for access',
    },
    { status: 405 }
  );
}