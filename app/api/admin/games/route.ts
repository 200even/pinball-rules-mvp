import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const game = await createGame(body);
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
