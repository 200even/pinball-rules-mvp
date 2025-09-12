#!/usr/bin/env tsx

import { createGame, createRuleset, createRuleSection } from '../lib/db';
import { generateEmbedding, prepareTextForEmbedding } from '../lib/embeddings';
import { indexGames, indexRuleSections, initializeIndexes } from '../lib/meili';

const attackFromMarsRules = `# Attack from Mars Overview

Attack from Mars is a 1995 pinball machine manufactured by Bally. The theme revolves around defending Earth from a Martian invasion.

## Multiball

### Starting Multiball
- Complete the saucer sequence by hitting the flying saucer 5 times
- Each hit advances the sequence: "Scan", "Beam Up Cow", "Destroy Crop", "Abduct Human", "Total Annihilation"
- After "Total Annihilation", multiball starts with 3 balls

### Multiball Scoring
- Jackpots are lit at the center ramp and right ramp
- Base jackpot value starts at 20 million
- Each jackpot collected increases the value by 5 million
- Super Jackpot is lit at the saucer after collecting 2 jackpots

## Martian Attack

### Attack Mars
- Spell MARS by hitting the drop targets
- Each completed MARS lights one of the four attack planets
- Attack planets in order: Mars, Venus, Jupiter, Mercury
- Each planet has different requirements and scoring

### Bonus Features
- Stroke of Luck: Random bonus awarded during play
- Big-O-Beam: Destroy all drop targets for bonus points
- Motor City: Collect letters for extra ball

## Wizard Mode

### Rule the Universe
- Collect all 4 attack planets to start wizard mode
- 4-ball multiball with unlimited ball save
- All shots score jackpots worth 50 million
- Mode lasts 45 seconds
- Completing wizard mode awards 500 million points`;

const godzillaRules = `# Godzilla Overview

Godzilla is a 2021 pinball machine manufactured by Stern Pinball, based on the MonsterVerse films.

## Multiball Modes

### City Multiball
- Hit the building ramp 3 times to start
- 3-ball multiball with building destruction theme
- Jackpots available at ramps and Mech shot
- Super Jackpot at the Godzilla ramp

### Oxygen Destroyer Multiball
- Complete the Oxygen Destroyer sequence
- Spell O-X-Y-G-E-N by hitting various shots
- 2-ball multiball with timed jackpots
- Destroy the oxygen destroyer for massive points

## Kaiju Battles

### Kong vs Godzilla
- Start by completing Kong shots
- Timed mode where you choose attacks
- Hit flashing shots to deal damage
- Defeat Kong for 100 million points

### Mechagodzilla Battle
- Activate by completing Mech sequences
- Multi-phase battle with different requirements
- Use teamwork shots for maximum damage
- Victory awards city multiball

## Power-Ups

### Atomic Breath
- Charge by hitting Godzilla shots
- When charged, all shots score double
- Lasts for 30 seconds
- Can be stacked with other modes

### Building Destruction
- Hit building shots to increase multiplier
- Each building destroyed adds 2X to bonus
- Maximum 10X bonus multiplier
- Carries over between balls`;

async function seedGame(title: string, manufacturer: string, year: number, system: string, rulesMarkdown: string, romVersion?: string) {
  console.log(`\n🎯 Seeding ${title}...`);
  
  // Create game
  const game = await createGame({
    title,
    manufacturer,
    year,
    system,
    ipdb_id: title === 'Attack from Mars' ? 4032 : 10518,
    pinside_id: title === 'Attack from Mars' ? 233 : 68241,
  });
  
  console.log(`✅ Created game: ${game.title} (${game.id})`);
  
  // Create ruleset
  const ruleset = await createRuleset({
    game_id: game.id,
    rom_version: romVersion,
    provenance: {
      source: 'seed_script',
      created_at: new Date().toISOString(),
    },
  });
  
  console.log(`✅ Created ruleset (${ruleset.id})`);
  
  // Parse markdown into sections
  const sections = parseMarkdownSections(rulesMarkdown);
  const ruleSections = [];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`📝 Processing section: ${section.title}`);
    
    // Generate embedding
    const embeddingText = prepareTextForEmbedding(section.title, section.body);
    const embedding = await generateEmbedding(embeddingText);
    
    // Create rule section
    const ruleSection = await createRuleSection({
      ruleset_id: ruleset.id,
      section_type: section.type,
      title: section.title,
      body: section.body,
      facts: section.facts,
      order_idx: i,
      embedding,
    });
    
    ruleSections.push({
      ...ruleSection,
      game_title: game.title,
      rom_version: ruleset.rom_version,
    });
  }
  
  console.log(`✅ Created ${ruleSections.length} rule sections with embeddings`);
  
  // Index in Meilisearch
  try {
    await indexGames([{
      id: game.id,
      title: game.title,
      manufacturer: game.manufacturer,
      year: game.year,
      system: game.system,
      ipdb_id: game.ipdb_id,
      pinside_id: game.pinside_id,
    }]);
    
    await indexRuleSections(ruleSections.map(section => ({
      id: section.id,
      ruleset_id: section.ruleset_id,
      game_id: game.id,
      game_title: game.title,
      rom_version: section.rom_version,
      section_type: section.section_type,
      title: section.title,
      body: section.body,
      facts: section.facts,
      order_idx: section.order_idx,
    })));
    
    console.log(`✅ Indexed in Meilisearch`);
  } catch (error) {
    console.warn(`⚠️  Meilisearch indexing failed:`, error);
  }
  
  return { game, ruleset, sections: ruleSections };
}

function parseMarkdownSections(markdown: string) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for headers
    if (trimmedLine.startsWith('#')) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          body: currentContent.join('\n').trim(),
        });
      }
      
      // Start new section
      const headerLevel = (trimmedLine.match(/^#+/) || [''])[0].length;
      const title = trimmedLine.replace(/^#+\s*/, '');
      
      currentSection = {
        title,
        type: getSectonType(title, headerLevel),
        facts: extractFacts(title),
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push({
      ...currentSection,
      body: currentContent.join('\n').trim(),
    });
  }
  
  return sections;
}

function getSectonType(title: string, level: number): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('overview') || titleLower.includes('introduction')) {
    return 'overview';
  }
  if (titleLower.includes('multiball')) {
    return 'multiball';
  }
  if (titleLower.includes('wizard') || titleLower.includes('mode')) {
    return 'wizard_mode';
  }
  if (titleLower.includes('bonus') || titleLower.includes('scoring')) {
    return 'scoring';
  }
  if (titleLower.includes('battle') || titleLower.includes('attack')) {
    return 'mode';
  }
  if (level === 1) {
    return 'major_feature';
  }
  if (level === 2) {
    return 'feature';
  }
  
  return 'rule';
}

function extractFacts(title: string): Record<string, any> {
  const facts: Record<string, any> = {};
  
  // Extract some basic facts based on common patterns
  if (title.toLowerCase().includes('multiball')) {
    facts.feature_type = 'multiball';
  }
  if (title.toLowerCase().includes('wizard')) {
    facts.feature_type = 'wizard_mode';
  }
  if (title.toLowerCase().includes('bonus')) {
    facts.feature_type = 'bonus';
  }
  
  return facts;
}

async function main() {
  console.log('🚀 Starting seed process...\n');
  
  try {
    // Initialize Meilisearch indexes
    console.log('🔧 Initializing Meilisearch indexes...');
    await initializeIndexes();
    console.log('✅ Meilisearch indexes initialized\n');
    
    // Seed Attack from Mars
    await seedGame(
      'Attack from Mars',
      'Bally',
      1995,
      'WPC',
      attackFromMarsRules,
      'L-5'
    );
    
    // Seed Godzilla
    await seedGame(
      'Godzilla',
      'Stern',
      2021,
      'Spike 2',
      godzillaRules,
      '1.66'
    );
    
    console.log('\n🎉 Seed process completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit /games to see the seeded games');
    console.log('2. Try asking the AI questions about the rules');
    console.log('3. Use the admin panel to add more games');
    
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
