import { NextRequest, NextResponse } from 'next/server';
import { query, updateRuleSectionEmbedding } from '@/lib/db';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { section_ids } = await request.json();
    
    for (const sectionId of section_ids) {
      const result = await query(
        'SELECT title, body FROM rule_sections WHERE id = $1',
        [sectionId]
      );
      
      if (result.rows.length > 0) {
        const { title, body } = result.rows[0];
        const text = prepareTextForEmbedding(title, body);
        const embedding = await generateEmbedding(text);
        
        await updateRuleSectionEmbedding(sectionId, embedding);
      }
    }
    
    return NextResponse.json({ success: true, processed: section_ids.length });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 });
  }
}
