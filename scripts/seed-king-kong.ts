import { getPool, query, createGame, createRuleset, createRuleSection, updateRuleSectionEmbedding } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

async function seedKingKong() {
  console.log('🦍 Seeding King Kong: Myth of Terror Island...');

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.length < 40) {
    console.warn('⚠️  OpenAI API key is not configured. Embeddings will be skipped.');
  }

  const client = getPool();

  try {
    // Insert the game
    const game = await createGame({
      title: 'King Kong: Myth of Terror Island',
      manufacturer: 'Stern Pinball',
      year: 2025,
      system: 'SPIKE 2',
      ipdb_id: null, // TBD - new game
      pinside_id: null, // TBD - new game
    });

    console.log(`✅ Created game: ${game.id}`);

    // Insert the ruleset
    const ruleset = await createRuleset({
      game_id: game.id,
      rom_version: '0.85',
      provenance: {
        source: 'Tilt Forums Wiki',
        url: 'https://tiltforums.com',
        date_scraped: new Date().toISOString(),
        code_revision: '0.85',
        designers: {
          lead_designer: 'Keith Elwin',
          code_rules: 'Rick Naegele, Joshua Henderson',
          lead_mechanical: 'Harrison Drake',
          artwork: 'Kevin O\'Connor, Greg Freres, Jeremy Packer',
          display_animations: 'Chuck Ernst',
          sound_design: 'Jerry Thompson'
        },
        release_date: 'April 2025'
      },
    });

    console.log(`✅ Created ruleset: ${ruleset.id}`);

    // Rule sections data
    const ruleSections = [
      {
        title: 'Game Overview',
        section_type: 'overview',
        body: `King Kong: Myth of Terror Island is the long-awaited King Kong pinball machine 35 years in the making (Data East planned one, but it went unreleased due to high production costs). The machine uses entirely original assets and primarily bases itself on the original 1930s King Kong novel.

**Design Team:**
- Lead Designer: Keith Elwin
- Code/Rules: Rick Naegele, Joshua Henderson
- Lead Mechanical Engineer: Harrison Drake
- Artwork: Kevin O'Connor, Greg Freres, Jeremy Packer
- Display and Animations: Chuck Ernst
- Sound Design: Jerry Thompson
- Release Date: April 2025

**Story:** Ann Darrow, Jack Driscoll, and Carl Denham have arrived on the mysterious Terror Island to uncover its secrets. Denham, the ambitious filmmaker, aims to capture King Kong, the legendary beast that roams the island, while Jack and Ann are more concerned with uncovering the island's mystical riches.`,
        order_idx: 1,
        facts: {
          manufacturer: 'Stern Pinball',
          year: 2025,
          designer: 'Keith Elwin',
          system: 'SPIKE 2',
          theme: '1930s King Kong novel',
          development_time: '35 years in planning'
        }
      },
      {
        title: 'Skill Shots',
        section_type: 'skill_shot',
        body: `**Available Skill Shots:**

1. **Skill Shot:** Plunge the ball into the pit targets
2. **Super Skill Shot:** Plunge the ball into the river lane near the mini-flipper
3. **Anti-Skill Shot:** Plunge the ball into the left outlane (there's an "anti-skill luck shot" if the ball bounces back from the post and hits the right spinner!)
4. **Secret Skill Shot:** Plunge the ball into the inner left inlane
5. **Super Secret Skill Shot:** Plunge the ball into the outer left inlane
6. **Mega Secret Skill Shot:** Plunge to the upper left flipper and make a reflex shot to the cliffs ramp (scores 1.75M and 8 seconds of ball save time)
7. **Triple Mega Secret Skill Shot:** Perform the Mega Secret skill shot and shoot the upper loop when the ball heads to the upper flipper for an additional 1M

**Skill Shot Benefits:**
- Each skill shot adds initial ball-save time (on default settings)
- Each unique skill shot made during a game instantly adds a letter to KING KONG
- If the ball falls back into the shooter lane during single-ball play, a "Sneak-In" award starting at 1M is earned
- The "Pisang Raja" banana combo requires a ricochet from the Pit targets

Skill shots are also used during the Deadeye side mode.`,
        order_idx: 2,
        facts: {
          skill_shot_count: 7,
          mega_secret_value: '1.75M + 8 seconds ball save',
          triple_mega_bonus: '1M additional',
          sneak_in_award: '1M starting value',
          king_kong_letters: 'awarded for unique skill shots'
        }
      },
      {
        title: 'Main Objectives & 8th Wonder',
        section_type: 'objectives',
        body: `There are six main objectives listed above the flippers that must be completed to qualify the wizard mode, **8th Wonder**:

1. **Island Scenes** - Complete all five island scenes
2. **Climbing the Building** - Climb buildings in NYC
3. **NYC Events** - Complete all three NYC events  
4. **Biplane Attack** - Destroy 5 biplanes
5. **Spell KING KONG** - Collect all 8 letters to enable T-Rex Battle
6. **T-Rex Battle** - Defeat the T-Rex

**Multiball Requirements:**
- Score a super jackpot during King Kong Multiball
- Start all three Pit Multiballs

These objectives can be advanced simultaneously in some cases, but others are mutually exclusive. The wizard mode represents the ultimate challenge of the game.`,
        order_idx: 3,
        facts: {
          main_objectives: 6,
          wizard_mode: '8th Wonder',
          multiball_requirements: 'Kong super jackpot + 3 pit multiballs',
          simultaneous_progress: 'some objectives can overlap'
        }
      },
      {
        title: 'Island Scenes',
        section_type: 'modes',
        body: `**Starting Island Scenes:**
Shoot the gong to light island scenes at the same shot that was used to start them. On Pro models (lacking a gong), island arrows must be collected: one arrow for the first scene, increasing by one per scene to a max of five.

**Scene Rules:**
- 60-second time limit per scene
- Timer can be extended by +15 seconds by hitting the gong (once per scene)
- Any multiball can be started during a scene
- Mode timer freezes at 15 seconds during multiball until back to single ball
- Each completed scene awards a map segment

**The Five Island Scenes:**

**1. Save Ann:** Shoot lit shots to build gong value (starts at 3M). Lit shots score 250K + 25K per shot, increase gong by 500K + 50K per shot. Combo shots are worth 2x. Shoot gong 3 times, then final hurry-up shot.

**2. Cross the Chasm:** River entrance is always lit - hitting it raises diverter and lights cliffs ramp. Shoot cliffs ramp to save sailors (base 2M, +500K per sailor). Miss the ramp and lose a sailor (resets to 2M). Combo U-turn after saving awards 2x.

**3. Pterodactyl Attack:** Hit moving drop targets to defeat pterodactyls and light Kong Cave VUK for 2x award. Clean shot triggering rollover above cave makes it 3x. Collect four cave awards to complete.

**4. Stegosaurus Encounter:** Choose easy path (slow flash) or hard path (quick flash). Hard path increases multiplier +1x for rest of mode. Base value starts at 1M, +250K per shot. Need 7 total shots.

**5. Escape the Swamp:** Build punchback jackpot value by shooting flashing shots. After scoring jackpot, shoot upper flipper shot to multiply (side ramp 2x, upper loop 3x, river lane 4x). Collect three jackpots to complete.`,
        order_idx: 4,
        facts: {
          scene_count: 5,
          time_limit: '60 seconds',
          gong_extension: '+15 seconds once per scene',
          map_segment_reward: 'awarded per completed scene',
          multiball_stacking: 'allowed during scenes'
        }
      },
      {
        title: 'Climbing the Building',
        section_type: 'progression',
        body: `Shoot yellow-lit "climb" arrows to ascend the building and collect awards. 4 inserts are initially lit at random; each awards 25 ft and unlights when shot. Complete the set to climb one section and light another set.

**Progression:**
- Sets 1-3: 4 lit arrows for 25 ft each
- Set 4+: 5 lit arrows for 20 ft each  
- Set 7+: 6 lit arrows

**Building Awards:**
- 100 ft: 5M + map segment
- 200 ft: Light island lock + light extra ball
- 300 ft: 10M + light NYC event 1
- 400 ft: Spot KING KONG letter
- 500 ft: Light island lock
- 600 ft: 10M + light NYC event 2
- 700 ft: Spot a map segment
- 1000 ft: 10M + light NYC event 3

The building climb is a persistent progression that carries across balls and provides key unlocks for other game features.`,
        order_idx: 5,
        facts: {
          initial_arrows: 4,
          arrow_value_early: '25 ft',
          arrow_value_later: '20 ft (sets 4+)',
          max_arrows: '6 (sets 7+)',
          first_extra_ball: '200 ft',
          nyc_events: 'unlocked at 300ft, 600ft, 1000ft'
        }
      },
      {
        title: 'NYC Events',
        section_type: 'modes',
        body: `Complete climb shots on current building level to light right orbit for NYC Event. NYC Events cannot stack with other modes and will end Rapids, King Kombos, and/or Biplane Attack immediately.

**Three Event Modifiers (choose via left flipper):**

**1. 3-Ball Multiball (1x scoring):**
- Advancing a stage typically adds a ball
- Draining to 1 ball ends the mode
- Completing starts victory laps

**2. Limited Flip Count (2x scoring):**
- Single-ball, each flipper starts with 30 flips
- Ball save active for duration
- Gong adds 10 flips to both (max 3 times)
- Advancing adds 3 flips each
- Draining subtracts 5 from both
- Mode ends when both flippers out of flips

**3. Single-Ball Timed (3x scoring):**
- 12-second ball saver at start
- 60-second limit, completing phases adds time
- Bonus points awarded for time remaining

Each modifier can only be chosen once per game.

**The Three NYC Events:**

**Stage Fright:** Kong needs to escape. 5 phases of different shots, break chains via punchback target. Biplane ramp boosts values.

**Window Shopping:** Kong searches for Ann. Shoot climb shots to light jackpots, biplane ramp spots shots or adds multiplier.

**Manhattan Rampage:** Kong causes street havoc. Light major shots solid, complete shot lanes for super jackpot or Kong cave completion.`,
        order_idx: 6,
        facts: {
          event_count: 3,
          modifier_types: '3-ball multiball, limited flips, timed',
          scoring_multipliers: '1x, 2x, 3x respectively',
          exclusivity: 'cannot stack with other modes',
          one_time_modifiers: 'each modifier chosen only once per game'
        }
      },
      {
        title: 'Biplane Attack',
        section_type: 'timed_mode',
        body: `**Starting Biplane Attack:**
Make 3 shots to the side ramp to start the first attack.

**Gameplay:**
30-second timed mode that lights side ramp for jackpot. Jackpot value increases as other switches are hit. Left and right spinners alternate being lit to increase the value each switch adds.

**Special Combos (add +250K to next side ramp):**
- **Barrel Roll:** Left orbit → Side ramp
- **Chandelle Maneuver:** Center ramp → Punchback target → Side ramp

**Objective:**
Destroying 5 biplanes total is required for 8th Wonder qualification.

Each jackpot scored destroys one biplane. Multiple biplanes can be destroyed in one round of Biplane Attack. The mode can be retriggered by making additional side ramp shots to start new 30-second attack windows.`,
        order_idx: 7,
        facts: {
          start_requirement: '3 side ramp shots',
          time_limit: '30 seconds',
          target_biplanes: '5 total for 8th Wonder',
          special_combos: 2,
          combo_bonus: '+250K to next side ramp',
          jackpot_mechanics: 'value builds via switch hits'
        }
      },
      {
        title: 'KING KONG Letters',
        section_type: 'collection',
        body: `Collect all eight KING KONG letters to light T-Rex Battle.

**Ways to Collect Letters:**
- Making a skill shot (one letter per unique skill shot)
- Filling the green bar via switch hits (lit at gong)
- Scoring 3, 15, etc. cliffs ramp shots (lit at gong)
- Climbing 700 ft (awards 3 KONG letters instantly)
- Flawless super sweep (sweep all four drop targets before side ramp)

**Letter Rewards:**

**Set 1:**
- K: 5M
- I: Light island jackpot
- N: Next cliffs shot awards 2x progress
- G: Light deadeye (Pro) / Light island jackpot (Prem/LE)
- K: Next river shot awards 2x progress
- O: Light island jackpot (Pro) / Light deadeye (Prem/LE)
- N: Next pit shot awards 2x progress + map segment
- G: Light T-Rex battle

**Set 2:**
- K: 5M
- I: Light island jackpot
- N: Next biplane shot awards 2x progress
- G: Light deadeye (Pro) / Light island jackpot (Prem/LE)
- K: Next king kombos shot awards 5x value
- O: Light island jackpot (Pro) / Light deadeye (Prem/LE)
- N: Super cave target (10M + 5M per shot for 30 seconds)
- G: Light T-Rex battle`,
        order_idx: 8,
        facts: {
          total_letters: 8,
          collection_methods: 5,
          sets_available: 2,
          instant_award: '3 letters at 700ft climb',
          t_rex_unlock: 'requires complete spelling',
          deadeye_difference: 'Pro vs Premium/LE timing'
        }
      },
      {
        title: 'Deadeye Mode',
        section_type: 'skill_mode',
        body: `**Lighting Deadeye:**
- Pro: After collecting first "G" in KING KONG
- Premium/LE: After collecting "O" in KING KONG
- Only available during single-ball play

**Gameplay:**
Similar to Congo's Skill Fire mode. Ball held at Kong cave eject with unlimited ball save for 30 seconds. Make as many skill shots as possible by plunging with correct strength.

**Scoring:**
- Deadeye award starts at 1M, increases by 500K each award
- Skill shot multipliers:
  - Pit standups: 1x
  - Left outlane: 2x  
  - Left inlane: 3x
  - Outer-left inlane: 5x

**Jackpot Feature:**
After three Deadeye awards, river lane lights for Deadeye jackpot worth 3M + total value of non-jackpot awards. Process resets until time expires.

**Completion:**
Scoring the Deadeye jackpot awards a map segment.`,
        order_idx: 9,
        facts: {
          time_limit: '30 seconds',
          ball_save: 'unlimited during mode',
          starting_value: '1M',
          value_increase: '500K per award',
          max_multiplier: '5x (outer-left inlane)',
          jackpot_requirement: '3 awards',
          map_segment: 'awarded for jackpot'
        }
      },
      {
        title: 'T-Rex Battle',
        section_type: 'boss_mode',
        body: `**Starting T-Rex Battle:**
Once KING KONG is spelled, shoot the gong during single-ball, non-mode play.

**Battle Mechanics:**
- Shoot all flashing arrows while avoiding slingshots
- Biplane ramp spots random shots
- Hit 3 shots of same color (green left, blue right) to light Pummel at Spider Pit
- If 15 slingshots triggered, must hit gong to save Ann (pauses T-Rex damage progress)

**Pummel Phase:**
Once flashing arrows of same color are hit, shoot pit to hold ball and light action button. Rapidly mash button for 125K per press for 10 seconds.

**Pummel Bonuses:**
- Each red arrow shot during pummel: +500K to value, +1x multiplier, extends timer
- Multiplier applied to total button presses when timer expires

**Rewards:**
- Defeating one T-Rex: Add-a-ball
- Defeating both T-Rex: Complete mode, start victory laps, credit toward 8th Wonder

This is one of the most challenging single-player modes in the game.`,
        order_idx: 10,
        facts: {
          start_condition: 'KING KONG spelled + gong shot',
          slingshot_limit: '15 triggers save Ann',
          pummel_base: '125K per button press',
          pummel_time: '10 seconds',
          color_groups: 'green (left), blue (right)',
          t_rex_count: 2,
          victory_reward: 'victory laps + 8th Wonder credit'
        }
      },
      {
        title: 'King Kong Multiball',
        section_type: 'multiball',
        body: `**Lighting Locks:**
Complete glyph puzzle drop targets when "light kong lock" is flashing at center ramp. First time lights all three locks, afterwards only one at a time.

**Starting Multiball:**
Third lock starts King Kong Multiball (or lights it at right orbit on Pro).

**Premium/LE Start:**
Releases all three balls from train for 5M Kong awards at side ramp. Kong award resets to lower value for rest of multiball.

**Jackpot System:**
- Green shots score smaller awards with Kong award (5x) at side ramp
- Red jackpots must be lit by completing drop targets
- Punchback target: 1x jackpot
- Cliffs ramp: 2x jackpot
- Side ramp: Super jackpot after collecting either jackpot (combo for 2x super)

**Relock Feature:**
Collect all green arrow awards, then shoot center ramp to relock ball in train. Multiplies all jackpots by 2x for 20 seconds (Pro: ball not physically held).

**Add-a-Ball:**
Ring gong twice (once per multiball). Island mystery disabled during this multiball.

**Requirement:**
Scoring a super jackpot is required for 8th Wonder qualification.`,
        order_idx: 11,
        facts: {
          lock_requirement: 'glyph puzzle completion',
          initial_locks: '3 (first time), 1 (subsequent)',
          kong_award: '5M at side ramp',
          jackpot_multipliers: '1x punchback, 2x cliffs',
          super_jackpot: 'side ramp after any jackpot',
          relock_multiplier: '2x for 20 seconds',
          add_ball_method: 'ring gong twice'
        }
      },
      {
        title: 'Spider Pit Multiballs',
        section_type: 'multiball',
        body: `**Starting Pit Multiballs:**
Hit targets around pit to battle creatures. First multiball needs 4 shots (3 to light, 1 to start). Subsequent multiballs need 2 more shots. When one shot left, lit multiball changes every 10 seconds.

**The Three Pit Multiballs:**

**1. 2-Legged Lizard:**
Shoot pit 3 times to light jackpot and score increasing points. To score jackpot, shoot pit then knock ball held by magnet into targets. Lit shots increase jackpot by 500K.

**2. Octopus Insect:**
Shoot all three right-side standup targets to light pit jackpot. Far left standup increases target values, red shots increase jackpot value. Multiple rounds increase jackpot multiplier.

**3. Giant Spider:**
Collect 30 switch hits (+5 per jackpot) to light pit jackpot. Further hits increase base value. Shoot ramps for +1x multiplier (max 4x). Maximum jackpot: 25M x 4.

**Add-a-Ball:**
Island Mystery always awards Add-A-Ball first time collected during any pit multiball.

**Requirement:**
Starting all three pit multiballs is required for 8th Wonder qualification.`,
        order_idx: 12,
        facts: {
          multiball_count: 3,
          first_requirement: '4 pit shots',
          subsequent_requirement: '2 pit shots',
          rotation_timer: '10 seconds when 1 shot left',
          giant_spider_max: '25M x 4 jackpot',
          switch_requirement: '30 hits (+5 per jackpot)',
          guaranteed_add_ball: 'Island Mystery first collection'
        }
      },
      {
        title: 'Map Segments & Treasure Hunt',
        section_type: 'progression',
        body: `**Earning Map Segments:**
Complete objectives to earn segments toward current map. First map needs 2 segments, each subsequent map needs one more segment than the last.

**Map Segment Sources:**
- Completing any island scene
- Island scenes level 2
- Climb 100ft  
- Complete any NYC event
- Climb level 2
- Biplane attack level 2
- Second "N" in KING KONG
- Deadeye jackpot
- T-Rex Battle level 2
- Kong Multiball level 2 (2 super jackpots)
- Pit completed level 2
- Rapids jackpot
- 20 cliffs ramp shots
- 8 banana combos
- Rare mystery award (once per game)

**Treasure Hunt:**
Completing a map lights Kong cave for treasure hunt. Make six randomly lit gold shots following map directions - final shot always at Kong cave.

**Treasure Hunt Jackpot:**
Starts at 20M, increases via switch hits during hunt. Multiplied by +1x for every treasure found (hunt or Lost Temple glyphs). Ball drain loses the treasure.

**Treasure Hunt Perks:**
1. **Map 1:** +15 seconds to all super mode timers
2. **Map 2:** Double end-of-ball bonus for rest of game  
3. **Map 3 (Echo Horn):** Start every ball with maximum log bridge uses
4. **Map 4 (Jade Goat):** Easier 2x scoring (all targets count)
5. **Map 5:** 500M points (cannot be multiplied)`,
        order_idx: 13,
        facts: {
          map_progression: '2, 3, 4, 5... segments required',
          segment_sources: 15,
          treasure_hunt_shots: '6 random + Kong cave finale',
          base_jackpot: '20M',
          jackpot_multiplier: '+1x per treasure found',
          map_5_award: '500M unmultiplied',
          drain_penalty: 'lose current treasure'
        }
      },
      {
        title: 'River Awards & Rapids',
        section_type: 'lane_awards',
        body: `**River Lane Awards:**
Going through the river lane counts up and grants various awards:

- **3, 9, 12, 20, 30...:** Light Island Mystery
- **5, 15, 25...:** Rapids  
- **8:** Light Extra Ball

**Rapids Mode:**
Once Rapids begins, 30-second timer to loop center spinner shot to build collect value displayed on screen. Shoot Kong Cave to cash out, end Rapids, and collect a map segment.

The Rapids feature provides both immediate scoring opportunities and long-term progression through the map segment reward. The center spinner loop requirement makes this a skill-based collection mode.`,
        order_idx: 14,
        facts: {
          mystery_awards: '3, 9, 12, 20, 30... river shots',
          rapids_awards: '5, 15, 25... river shots',
          extra_ball: '8 river shots',
          rapids_timer: '30 seconds',
          rapids_shot: 'center spinner loop',
          rapids_cashout: 'Kong Cave',
          rapids_reward: 'map segment'
        }
      },
      {
        title: 'Log Bridge & Action Button',
        section_type: 'mechanical_feature',
        body: `**Log Bridge Mechanics:**
Hidden diverter near river shot that diverts balls to mini-flipper, allowing precise targeting of drop targets or cliffs ramp.

**Bridge Usage:**
- Start each ball with 2 log bridge uses
- Complete drop targets during ball to earn +1 use (max 5)
- Press action button right before ball enters river lane
- Works off right orbit or initial plunge

**Strategic Applications:**
Bridge often activates automatically during modes requiring cliffs ramp shots, but manual control allows strategic targeting when needed most.

This mechanical feature adds a layer of strategy and skill to shot selection, particularly valuable for completing difficult drop target combinations or accessing the upper playfield reliably.`,
        order_idx: 15,
        facts: {
          starting_uses: '2 per ball',
          earning_method: 'complete drop targets',
          maximum_uses: 5,
          activation_timing: 'right before river entry',
          automatic_modes: 'cliffs ramp requiring modes',
          target_destination: 'mini-flipper'
        }
      },
      {
        title: 'Cliff Awards & Power-Ups',
        section_type: 'shot_awards',
        body: `**Cliff Shot Awards:**
Shooting "The Cliffs" from upper playfield grants awards over the game span:

- **3, 15...:** KING KONG letter (or 15M if already spelled)
- **6:** Light cliffhanger (TBD on 0.85 code)
- **20:** Light cliffhanger + award map segment  
- **25:** Light Extra Ball

**2x Scoring:**
Orange targets marked with "X" around playfield must all be hit (twice for subsequent attempts). Hit the roving orange target moving left-right to start 2x scoring.

**2x Scoring Rules:**
- Timer extended by shooting lit orange targets
- Each lit orange target scores bonus during 2x
- Timer can be extended 4 times per activation
- Fourth treasure hunt makes 2x much easier (all targets count, any target starts when qualified)

**Power-Ups:**
TBD on 0.85 code - additional power-up mechanics to be implemented in future code updates.`,
        order_idx: 16,
        facts: {
          cliff_awards: '3, 6, 15, 20, 25 shots',
          extra_ball_cliffs: '25 shots',
          map_segment_cliffs: '20 shots',
          x_targets: '4 around playfield',
          roving_target: 'moves left-right',
          timer_extensions: '4 maximum per activation',
          treasure_4_benefit: 'all targets count for 2x'
        }
      },
      {
        title: 'Lost Temple & Island Treasure',
        section_type: 'bonus_feature',
        body: `**Lighting Lost Temple:**
Hit gong target twice while at least one unlit drop target is available. Once lit, next right orbit shot (single-ball only) sends ball to mini-flipper and lights an unlit drop target.

**Temple Mechanics:**
Hitting the lit drop target awards one light's progress toward glyph puzzle completion and instantly completes next drop target progress for King Kombos or light kong lock.

**Glyph Puzzle Completion:**
First treasure requires 3 flashing drop targets after lighting Lost Temple. Subsequent treasures require all 4 drop target lights. Shoot island treasure target behind upper drop targets to collect.

**Island Treasures:**
1. **Drillplate of Dunne:** 10M + Super Spinners (30 seconds alternating spinners, 100K + 50K per lit rip)
2. **Lost Skull of Ancients:** 10M + Super Kombos (King Kombos for 30 seconds at 3x value)  
3. **Heart of Keepers:** 10M + Extra Ball
4. **Moonstone of N'zai:** 10M + Super Rapids (30 seconds, all shots multiply river lane points)
5. **Obsidian Dagger:** 100M
6. **Serpent's Eye:** 100M

**Treasure Hunt Bonus:**
Each Island Treasure adds +1x multiplier to next treasure hunt jackpot.`,
        order_idx: 17,
        facts: {
          gong_requirement: '2 hits with unlit drop target',
          first_treasure: '3 flashing drop targets',
          subsequent_treasures: '4 drop target lights',
          treasure_count: 6,
          super_modes: 'Spinners, Kombos, Rapids (30 seconds each)',
          big_treasures: 'Obsidian Dagger, Serpent\'s Eye (100M each)',
          treasure_hunt_multiplier: '+1x per treasure found'
        }
      },
      {
        title: 'King Kombos & Special Combos',
        section_type: 'combo_system',
        body: `**King Kombos Mode:**
Clear drops when King Kombos insert is lit to start mode. Combo value builds as you continue shooting combos. Every 3 combos lights power-up.

**Always Available Combos:**

**Super Sweep:** Hit at least 2 drop targets in same shot through left orbit, then shoot side ramp. Awards 5M per drop target swept. If all 4 targets swept, side ramp awards 50M and spots KING KONG letter!

**Ricochet:** Shoot rubber near mini-flipper from right flipper, bouncing up cliffs ramp for 10M. Disqualified if left flipper pressed. Single-ball play only.

**Banana Combos:**
Many different combos corresponding to banana types during single-ball play. Collecting 8 awards a map segment.

**Special Banana Combos Include:**
- Various shot sequences named after banana varieties
- "Pisang Raja" requires sneak-in ricochet from pit targets
- Each combo has unique shot requirements and scoring

The combo system rewards flow and skillful shot-making while providing significant scoring opportunities and progression toward game objectives.`,
        order_idx: 18,
        facts: {
          king_kombos_trigger: 'clear drops when insert lit',
          power_up_frequency: 'every 3 combos',
          super_sweep_base: '5M per drop target',
          super_sweep_max: '50M + KING KONG letter (4 targets)',
          ricochet_value: '10M',
          banana_combo_target: '8 for map segment',
          ricochet_restriction: 'no left flipper press'
        }
      },
      {
        title: 'Island Mystery & Extra Balls',
        section_type: 'awards',
        body: `**Island Mystery:**
Light at Kong Cave VUK by collecting enough river shots.

**Mystery Awards:**
- 10M points
- Light island scene
- Spot climb arrow  
- Spot biplane ramp shot
- Spot KING KONG letter
- Light King Kong lock
- Advance pit
- Collect map segment (once per game)
- Spot river shot
- +2 log bridge uses
- 173,000 + spot cliffs ramp shot
- Spot lost temple glyph
- +3 bonus X
- Add-a-ball (always awarded during any spider pit multiball)

**Extra Ball Opportunities:**
- Climbing 200 ft (window 2)
- Destroying 6 biplanes
- 25 cliffs ramp shots  
- 8 river shots
- 3rd island treasure (Heart of Keepers) - awarded instantly

**Extra Ball Value:**
If disabled or limit reached, extra ball worth 15M (30M with 2x scoring).`,
        order_idx: 19,
        facts: {
          mystery_awards: 14,
          guaranteed_add_ball: 'during pit multiballs',
          extra_ball_sources: 5,
          extra_ball_value: '15M (30M with 2x)',
          map_segment_mystery: 'once per game only',
          bonus_x_mystery: '+3 bonus multiplier'
        }
      },
      {
        title: 'End-of-Ball Bonus',
        section_type: 'bonus',
        body: `**Bonus Calculation:**
- **100** x switch hits this ball
- **2,500** x height climbed  
- **150,000** x KING KONG letters collected
- **All multiplied by bonus X** (if applicable)

**Bonus X Sources:**
- Each drop target completion: +1 bonus X
- Island Mystery: +3 bonus X (rare award)

**Bonus Rules:**
- Height climbed and KING KONG letters are cumulative across balls
- Switch hits and bonus X reset each ball
- Second treasure hunt doubles entirety of end-of-ball bonus for rest of game

**Strategic Considerations:**
The bonus system rewards consistent switch hitting and progression through major game features. The treasure hunt doubling effect can make late-game bonuses extremely valuable, especially when combined with high bonus multipliers from drop target completions.`,
        order_idx: 20,
        facts: {
          switch_value: '100 per hit',
          height_value: '2,500 per foot',
          letter_value: '150,000 per letter',
          bonus_x_sources: 'drop targets (+1), mystery (+3)',
          cumulative_stats: 'height and letters',
          reset_stats: 'switch hits and bonus X',
          treasure_2_effect: 'doubles all bonus rest of game'
        }
      }
    ];

    // Insert rule sections
    for (const [index, section] of ruleSections.entries()) {
      const createdSection = await createRuleSection({
        ruleset_id: ruleset.id,
        title: section.title,
        section_type: section.section_type,
        body: section.body,
        order_idx: section.order_idx,
        facts: section.facts,
      });

      console.log(`✅ Created section ${index + 1}/${ruleSections.length}: ${section.title}`);

      // Generate embedding if API key is available
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length >= 40) {
        try {
          const embeddingText = `${section.title}\n${section.body}`;
          const embedding = await generateEmbedding(embeddingText);
          await updateRuleSectionEmbedding(createdSection.id, embedding);
          console.log(`🔮 Generated embedding for: ${section.title}`);
        } catch (error) {
          console.error(`❌ Error generating embedding for ${section.title}:`, error);
        }
      }
    }

    console.log('🎉 King Kong seeding completed successfully!');
    console.log(`📊 Added ${ruleSections.length} rule sections`);
    console.log('💡 Run "npm run reindex" to update Meilisearch with the new game');

  } catch (error) {
    console.error('❌ Error seeding King Kong:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedKingKong().catch((err) => {
  console.error('❌ King Kong seeding failed:', err);
  process.exit(1);
});
