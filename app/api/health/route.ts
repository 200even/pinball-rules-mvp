import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getMeiliClient } from '@/lib/meili';

export async function GET() {
  try {
    // Check database connection
    const pool = getPool();
    await pool.query('SELECT 1');

    // Check Meilisearch connection
    const meili = getMeiliClient();
    await meili.health();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        meilisearch: 'healthy',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: 'One or more services are unhealthy',
      },
      { status: 503 }
    );
  }
}
