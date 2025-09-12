import { NextRequest, NextResponse } from 'next/server';
import { createRuleset } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ruleset = await createRuleset(body);
    return NextResponse.json(ruleset);
  } catch (error) {
    console.error('Error creating ruleset:', error);
    return NextResponse.json({ error: 'Failed to create ruleset' }, { status: 500 });
  }
}
