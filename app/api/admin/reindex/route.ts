import { NextRequest, NextResponse } from 'next/server';
import { getGameById, getRulesetsByGameId, getRuleSectionsByRulesetId } from '@/lib/db';
import { indexGames, indexRuleSections } from '@/lib/meili';

export async function POST(request: NextRequest) {
  try {
    const { game_id } = await request.json();
    
    const game = await getGameById(game_id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Index game
    await indexGames([{
      id: game.id,
      title: game.title,
      manufacturer: game.manufacturer,
      year: game.year,
      system: game.system,
      ipdb_id: game.ipdb_id,
      pinside_id: game.pinside_id,
    }]);
    
    // Index rule sections
    const rulesets = await getRulesetsByGameId(game.id);
    let totalSections = 0;
    
    for (const ruleset of rulesets) {
      const sections = await getRuleSectionsByRulesetId(ruleset.id);
      
      if (sections.length > 0) {
        const sectionDocuments = sections.map(section => ({
          id: section.id,
          ruleset_id: section.ruleset_id,
          game_id: game.id,
          game_title: game.title,
          rom_version: ruleset.rom_version,
          section_type: section.section_type,
          title: section.title,
          body: section.body,
          facts: section.facts,
          order_idx: section.order_idx,
        }));
        
        await indexRuleSections(sectionDocuments);
        totalSections += sectionDocuments.length;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      game: game.title,
      sections_indexed: totalSections 
    });
  } catch (error) {
    console.error('Error reindexing:', error);
    return NextResponse.json({ error: 'Failed to reindex' }, { status: 500 });
  }
}
