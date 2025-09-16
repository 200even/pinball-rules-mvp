import { Pool } from 'pg';
import { generateEmbedding } from '../lib/embeddings';

async function seedJaws() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'pinball_rules',
    user: 'postgres',
    password: 'password',
  });

  try {
    console.log('🦈 Adding Jaws pinball game...');

    // Create the game
    const gameResult = await pool.query(`
      INSERT INTO games (title, manufacturer, year, system, ipdb_id, pinside_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Jaws', 'Stern', 2024, 'SPIKE-2', 7313, null]);

    const gameId = gameResult.rows[0].id;
    console.log(`✅ Created game: ${gameId}`);

    // Create the ruleset
    const rulesetResult = await pool.query(`
      INSERT INTO rulesets (game_id, rom_version, provenance)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [gameId, '1.01', JSON.stringify({
      source: 'TiltForums Wiki',
      author: 'CaptainBZarre',
      date: 'Aug 2024',
      url: 'https://tiltforums.com/t/jaws-rulesheet/5887'
    })]);

    const rulesetId = rulesetResult.rows[0].id;
    console.log(`✅ Created ruleset: ${rulesetId}`);

    // Define all the rule sections
    const ruleSections = [
      {
        section_type: 'overview',
        title: 'Game Overview',
        body: `Lead Designer: Keith Elwin
Code/Rules: Rick Naegele, Elizabeth Gieske
Lead Mechanical Engineer: Harrison Drake
Artwork: Michael Barnard
Sound Design: Jerry Thompson
Release Date: January 2024

Summer has arrived in the small New England town of Amity, and threatening sharks have put the town's beaches in danger. The player is assigned to save the town by rescuing beachgoers, closing the beaches, and taking on bounties to defeat the invading sharks, in hopes of eventually defeating Jaws, the Great White shark himself.`,
        facts: {
          designer: 'Keith Elwin',
          manufacturer: 'Stern',
          year: 2024,
          theme: 'Movie - Jaws'
        }
      },
      {
        section_type: 'skill_shot',
        title: 'Skill Shots',
        body: `The multi-level skill shot changes at the start of each ball, once the previous one has been scored. You get a maximum of three skill shot attempts per ball.

Level 1: Plunge into the pop bumper for 5M.
Level 2: Plunge into the lane above the mini-flipper, without hitting the bumper, for 10M + light gear.
Level 3: Shoot any target on the flashing left target bank, without any other switch hits, for 15M + light gear.

Each skill shot, regardless of level, also adds +5 seconds of ball save time.`,
        facts: {
          level_1_value: '5M',
          level_2_value: '10M + light gear',
          level_3_value: '15M + light gear',
          ball_save_bonus: '+5 seconds'
        }
      },
      {
        section_type: 'mode',
        title: 'Shark Encounters',
        body: `Shark Encounters are the main modes of the game. They can be started at any of the five "beach" shots, after enough shots to the captive ball / bash boat - 1 shot + 1 shot per Shark Encounter mode played.

The five shark encounters are:

**Night Swim** (Left Spinner): 2-phase mode with blue shots. Phase 1 requires 4 blue shots, Phase 2 has roving shots. Encounter jackpot: 35% of mode total (20% if fin missed).

**Beach Panic** (Wave Ramp): All shots lit with one 2x flashing shot. Need 8 shots to light final shot. Encounter jackpot: 50% of mode total (25% if fin missed).

**Scars** (Center Ramp): 3-phase mode with specific shots per phase. Shark tower hits reduce shot values. Encounter jackpot: 35% of mode total (15% if fin missed).

**Pond Attack** (Fishing Reel): Lit shots add to fishing reel award. Need 3 fishing reel awards. Encounter jackpot: 20% of mode total (10% if fin missed).

**Raft Attack** (Right Ramp): Shoot ramps to raise fin, or combo shots for multipliers. Need 3 fin awards. Encounter jackpot: 30% of mode total (15% if fin missed).

Complete all five to light 4th of July mini-wizard mode.`,
        facts: {
          total_encounters: 5,
          start_requirement: '1 bash boat shot + 1 per mode played',
          completion_reward: '4th of July mini-wizard mode'
        }
      },
      {
        section_type: 'multiball',
        title: 'Jaws Multiballs',
        body: `To start Jaws Multiball, first chum the water by shooting the captive ball, then shoot flashing red arrows to fill the chum line. Once full, shoot yellow shots to raise the shark fin and attach barrels.

**Jaws Multiball 1: Reel Him In!** (1 barrel required)
- Shoot red flashing shots for awards
- After 3 awards, jackpot shot flashes yellow/red
- Additional red shots increase jackpot up to 3x
- Complete by collecting 5 jackpots

**Jaws Multiball 2: The Chase** (2 barrels required)  
- Collect switch hits to light all major shots for jackpot
- Need jackpots at all 5 shots, then 90 switch hits
- Lights captive ball for 20M super jackpots (10 seconds)

**Jaws Multiball 3: Cage Dive** (3 barrels required)
- Shoot red shots before time runs out for hurry-up jackpot at captive ball
- After 3 jackpots, 50M super jackpots at fin drop target
- Completing this lights "Smile, You Son of A..." wizard mode`,
        facts: {
          total_levels: 3,
          barrel_requirements: [1, 2, 3],
          completion_reward: 'Final wizard mode'
        }
      },
      {
        section_type: 'multiball',
        title: 'Bounty Hunt Multiballs',
        body: `Four sharks can be hunted with specific requirements:

**Mako Shark**: 80 spins, 3 ramps, 1 pop hit, 2 chum bucket hits
- Reward: Upgraded Fishing Reel, longer flip-lock timer
- 2-ball multiball with +5 seconds ball save

**Thresher Shark**: 6 ramps, 3 3-bank targets, 5 boat shots, 4 chum bucket hits  
- Reward: 2 attempts per Quint's challenge, 2x multiball scoring while flip-locked
- 3-ball multiball

**Hammerhead Shark**: 150 spins, 6 3-bank targets, 4 pop hits, 2 mini-lanes
- Reward: Change fish finder award with left flipper, beach closed values held
- 3-ball multiball with add-a-ball at chum bucket

**Tiger Shark**: 6 3-bank targets, 5 pop hits, 10 boat hits, 4 mini-lanes
- Reward: Unlimited Flip-Lock uses (relight with 5 major shots)  
- 3-ball multiball with two add-a-balls

Capture all four sharks to qualify the Great White bounty hunt.`,
        facts: {
          total_sharks: 4,
          shark_names: ['Mako', 'Thresher', 'Hammerhead', 'Tiger'],
          completion_unlocks: 'Great White bounty hunt'
        }
      },
      {
        section_type: 'feature',
        title: 'Closing the Beaches',
        body: `Five beaches need to be closed by rescuing three beachgoers at each shot. Beachgoers are found by shooting shark tower targets.

Once all three beachgoers are rescued at a beach, a Beach Closed Hurry-Up starts:
- Value: 15M + 3M per Search/Rescue multiball played + 250K per character combo
- Boosts all future shots to that beach by 20% of hurry-up value
- 5th hurry-up gets bonus value from previous hurry-ups
- Ball saver active during 5th hurry-up

Closing all 5 beaches starts either Rescue Multiball or Search Multiball.

Rescuing 8 beachgoers awards extra ball and lights gear.`,
        facts: {
          beaches_total: 5,
          beachgoers_per_beach: 3,
          hurry_up_base_value: '15M',
          eighth_beachgoer_reward: 'Extra ball + light gear'
        }
      },
      {
        section_type: 'feature',
        title: 'Gear Collection',
        body: `Six types of gear can be collected at the right ramp:

**Binoculars**: 2 beachgoers lit per shark tower hit (3 uses)
**Oxygen Tank**: +5s ball save, +8s mode timers for rest of ball  
**Tracker**: Next 3 chum line advances are 2x faster
**Barrel Hook**: Jaws Multiball Extended - continues after single ball
**Shark Cage**: One-time ball save at fin drop target
**Dart**: Next bounty hunt advances 2x faster + +1x bounty multiplier

Once all six types found, can sell to Quint for points based on unused gear:
- 1 unused: 45M (x3)
- 2 unused: 75M (x5) 
- 3 unused: 120M (x8)
- 4 unused: 180M (x12)
- 5 unused: 240M (x16)
- 6 unused: 375M (x25)

+50M bonus per successful Quint's Challenge knot tied.`,
        facts: {
          total_gear_types: 6,
          max_cash_out: '375M',
          quint_knot_bonus: '+50M per knot'
        }
      },
      {
        section_type: 'feature',
        title: 'Fish Finder',
        body: `Qualified at left target bank, activated at mini-flipper lane.

Five Fish Finder awards:
1. **Super Buoys**: Slingshots lit for high points with multiplier
2. **Super Life Ring**: Every life ring shot scores 10M+ and adds time  
3. **Cast 'n' Catch**: Two count-up shots at center/right ramp (1M-30M)
4. **Light Video Mode**: Shark Hunter video mode at right ramp
5. **Night Search Multiball**: 2-ball multiball with relight mechanics

Video Mode: Use flippers to fire harpoons at sharks, avoid divers. 2x scoring at 5000 points. Final score x 3000 for pinball points.

Collect all five awards to light Super Cast 'n Catch mini-wizard mode.`,
        facts: {
          total_awards: 5,
          video_mode_multiplier: 'x3000',
          completion_reward: 'Super Cast n Catch mini-wizard'
        }
      },
      {
        section_type: 'feature',
        title: 'Quickshots',
        body: `Light harpoon lane at right mini-flipper lane, then shoot fin drop target quickly.

Base value: 3M + 200K per beachgoer rescued
Multiplier: +1x per successful quickshot (max 7x), resets on miss
Each quickshot lights gear at right ramp

Make 3 quickshots for extra ball.

Timer decreases with each quickshot collected, requiring faster precision.`,
        facts: {
          base_value: '3M + 200K per beachgoer',
          max_multiplier: '7x',
          extra_ball_requirement: '3 quickshots'
        }
      },
      {
        section_type: 'feature',
        title: 'Character Combos',
        body: `Seven unique shot sequences award increasing points (5M + 5M each). Each adds +250K to all beach closed shots.

1. **Chrissie Watkins**: Left orbit → Right ramp → Center ramp
2. **Pipit**: Wave ramp → Harpoon lane (Pro) / Lookout tower (Prem/LE)  
3. **Alex Kintner**: Right ramp → Center ramp → Reel spinner → Harpoon lane
4. **Ben Gardner**: Center ramp → Right ramp → Left orbit
5. **Scout Leader**: Reel spinner → Harpoon lane → Life ring target
6. **Sam Quint**: Reel spinner → Harpoon lane → Captive ball/shark
7. **Goat**: Center ramp → Right ramp → Chum bucket

Only available during single-ball play.`,
        facts: {
          total_combos: 7,
          point_progression: '5M + 5M per combo',
          beach_bonus: '+250K per combo to beach shots'
        }
      },
      {
        section_type: 'wizard_mode',
        title: 'Smile, You Son of A... (Final Wizard Mode)',
        body: `The final wizard mode, lit after completing Jaws Multiball 3. Three phases with 60-second timers:

**Phase 1 - Quint's Demise**: Alternate between lit shots and shark
- Center ramp → Shark → Right ramp → Shark → Wave ramp → Shark → Right ramp (hurry-up)

**Phase 2 - Clash on the Mast**: Complete fish finder targets to light center ramp  
- Bash shark 3 times to light left orbit, center ramp, right ramp for hurry-up

**Phase 3 - Smile, You Son of A...**: Final confrontation

Each phase ends with hurry-up worth 1M x seconds remaining. Hurry-ups add time to next phase (40s phase 2, 30s phase 3).

Completing final phase starts Super Celebration Multiball: 6-ball multiball with 30s ball saver and massive scoring bonuses.`,
        facts: {
          phases: 3,
          phase_timer: '60 seconds each',
          hurry_up_value: '1M x seconds remaining',
          final_reward: 'Super Celebration Multiball'
        }
      },
      {
        section_type: 'wizard_mode',
        title: '4th of July (Mini-Wizard Mode)',
        body: `Started after completing all 5 shark encounters. Keep beaches open by collecting fireworks.

Goal: Collect 25 fireworks by shooting lit shots before beach timers expire
- Each shot reduces beach timer inserts by 1
- Timers increase faster as more shots are made
- Center ramp → Right ramp combos don't affect timers
- Repeated shots deactivate beach until unique shot made

Harpoon lane or Orca shots reset all beach timers
Fish finder targets add fireworks without decreasing timers

Super jackpot at captive ball/bash boat after 25 fireworks collected
- Multiplier based on beaches still open
- Reopens one closed beach

Every firework adds 150K to Super Celebration Multiball jackpots.`,
        facts: {
          fireworks_needed: 25,
          timer_reset_shots: 'Harpoon lane, Orca shots',
          super_jackpot_multiplier: 'Based on open beaches'
        }
      },
      {
        section_type: 'wizard_mode', 
        title: 'Rescue & Search Multiballs',
        body: `Choose between two multiballs after closing all 5 beaches:

**Rescue Multiball**: Evacuate beachgoers before shark devours them
- Shoot flashing shots for 1x/2x/3x jackpots based on saved beachgoers
- Blue shot represents pursuing shark - shoot to spot current location
- Super jackpot: Shoot boat captive ball, then repeatedly hit fin (2M per hit, max 30M)
- Add balls by hitting chum bucket 6 times

**Search Multiball**: Two-phase multiball  
- Phase 1: 2 balls, 30s ball save, add balls by hitting orange arrows
- Shoot chum bucket or complete shark towers to raise fin for 5M + 2M per jackpot
- Phase 2: 60s timer, shoot captive ball for 3M + 1M per jackpot x balls in play x orange arrow multiplier
- Need 5 shark jackpots to complete

Different perks for Super Celebration Multiball:
- Rescue: 10M per bumper hit  
- Search: All jackpots stay lit`,
        facts: {
          choice_after: 'Closing all 5 beaches',
          rescue_super_jackpot: 'Up to 30M per fin hit',
          search_phases: 2,
          celebration_perks: 'Different bonuses based on choice'
        }
      }
    ];

    // Insert rule sections with embeddings
    console.log('📝 Adding rule sections with embeddings...');
    
    for (let i = 0; i < ruleSections.length; i++) {
      const section = ruleSections[i];
      console.log(`Processing: ${section.title}`);
      
      // Generate embedding
      let embedding = null;
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length > 40) {
        try {
          const embeddingText = `${section.title}\n${section.body}`;
          embedding = await generateEmbedding(embeddingText);
        } catch (error) {
          console.log(`⚠️  Skipping embedding for ${section.title} (OpenAI error)`);
          embedding = null;
        }
      } else {
        console.log(`⚠️  Skipping embedding for ${section.title} (no OpenAI API key)`);
      }

      // Insert the section
      await pool.query(`
        INSERT INTO rule_sections (ruleset_id, section_type, title, body, facts, order_idx, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        rulesetId,
        section.section_type,
        section.title,
        section.body,
        JSON.stringify(section.facts),
        i + 1,
        embedding ? `[${embedding.join(',')}]` : null
      ]);
      
      console.log(`✅ Added section: ${section.title}`);
    }

    console.log('🎉 Jaws game added successfully!');
    console.log(`Game ID: ${gameId}`);
    console.log(`Total sections: ${ruleSections.length}`);

  } catch (error) {
    console.error('❌ Error adding Jaws:', error);
  } finally {
    await pool.end();
  }
}

seedJaws();
