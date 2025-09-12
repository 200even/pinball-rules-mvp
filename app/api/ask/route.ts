import { NextRequest, NextResponse } from 'next/server';
import { generateRAGResponse } from '@/lib/retrieval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, gameId } = body;

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

    // Generate RAG response
    const ragResponse = await generateRAGResponse(query, gameId);

    return NextResponse.json({
      success: true,
      data: ragResponse,
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);

    // Check for specific OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
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
    },
    { status: 405 }
  );
}
