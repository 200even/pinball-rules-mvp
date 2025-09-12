#!/usr/bin/env tsx

import { getGames, getRulesetsByGameId, getRuleSectionsByRulesetId } from '../lib/db';
import { indexGames, indexRuleSections, initializeIndexes, clearIndexes } from '../lib/meili';

async function reindexAll() {
  console.log('🚀 Starting reindex process...\n');
  
  try {
    // Initialize Meilisearch indexes
    console.log('🔧 Initializing Meilisearch indexes...');
    await initializeIndexes();
    console.log('✅ Meilisearch indexes initialized');
    
    // Clear existing data
    console.log('🧹 Clearing existing search indexes...');
    await clearIndexes();
    console.log('✅ Indexes cleared');
    
    // Get all games
    console.log('📊 Fetching games from database...');
    const games = await getGames();
    console.log(`✅ Found ${games.length} games`);
    
    if (games.length === 0) {
      console.log('ℹ️  No games found. Run the seed script first.');
      return;
    }
    
    // Index games
    console.log('🎯 Indexing games...');
    const gameDocuments = games.map(game => ({
      id: game.id,
      title: game.title,
      manufacturer: game.manufacturer,
      year: game.year,
      system: game.system,
      ipdb_id: game.ipdb_id,
      pinside_id: game.pinside_id,
    }));
    
    await indexGames(gameDocuments);
    console.log(`✅ Indexed ${gameDocuments.length} games`);
    
    // Get and index rule sections
    console.log('📝 Fetching and indexing rule sections...');
    let totalSections = 0;
    
    for (const game of games) {
      console.log(`  Processing ${game.title}...`);
      
      const rulesets = await getRulesetsByGameId(game.id);
      
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
          console.log(`    ✅ Indexed ${sectionDocuments.length} sections`);
        }
      }
    }
    
    console.log(`\n🎉 Reindex completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Games indexed: ${gameDocuments.length}`);
    console.log(`   - Rule sections indexed: ${totalSections}`);
    console.log(`\n💡 Search functionality is now up to date.`);
    
  } catch (error) {
    console.error('❌ Reindex process failed:', error);
    process.exit(1);
  }
}

async function reindexGame(gameId: string) {
  console.log(`🚀 Reindexing game ${gameId}...\n`);
  
  try {
    // Get the specific game
    const games = await getGames();
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      console.error(`❌ Game with ID ${gameId} not found`);
      process.exit(1);
    }
    
    console.log(`🎯 Found game: ${game.title}`);
    
    // Index the game
    await indexGames([{
      id: game.id,
      title: game.title,
      manufacturer: game.manufacturer,
      year: game.year,
      system: game.system,
      ipdb_id: game.ipdb_id,
      pinside_id: game.pinside_id,
    }]);
    
    // Get and index rule sections for this game
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
    
    console.log(`\n✅ Game reindexed successfully!`);
    console.log(`📊 Indexed ${totalSections} rule sections for ${game.title}`);
    
  } catch (error) {
    console.error('❌ Game reindex failed:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Reindex all
    await reindexAll();
  } else if (args[0] === '--game' && args[1]) {
    // Reindex specific game
    await reindexGame(args[1]);
  } else {
    console.log('Usage:');
    console.log('  npm run reindex              # Reindex all games and sections');
    console.log('  npm run reindex --game <id>  # Reindex specific game');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
