import { getPool, query, createGame, createRuleset, createRuleSection, updateRuleSectionEmbedding } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

async function seedIronMaiden() {
  console.log('🤘 Seeding Iron Maiden: Legacy of the Beast...');

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.length < 40) {
    console.warn('⚠️  OpenAI API key is not configured. Embeddings will be skipped.');
  }

  const client = getPool();

  try {
    // Insert the game
    const game = await createGame({
      title: 'Iron Maiden: Legacy of the Beast',
      manufacturer: 'Stern Pinball',
      year: 2018,
      system: 'SPIKE 2',
      ipdb_id: null, // TBD - need to look up
      pinside_id: null, // TBD - need to look up
    });

    console.log(`✅ Created game: ${game.id}`);

    // Insert the ruleset
    const ruleset = await createRuleset({
      game_id: game.id,
      rom_version: '1.10',
      provenance: {
        source: 'Tilt Forums Wiki',
        url: 'https://tiltforums.com',
        date_scraped: new Date().toISOString(),
        code_revision: '1.10',
        designers: {
          lead_designer: 'Keith Elwin',
          code_rules: 'Rick Naegele and Keith Elwin',
          lead_mechanical_engineer: 'Harrison Drake',
          artwork: 'Zombie Yeti',
          display_animations: 'Zak Stark',
          music_sound: 'Jerry Thompson'
        },
        release_date: 'March 2018',
        notes: 'Keith Elwin\'s first ever design for Stern Pinball'
      },
    });

    console.log(`✅ Created ruleset: ${ruleset.id}`);

    // Rule sections data
    const ruleSections = [
      {
        title: 'Game Overview',
        section_type: 'overview',
        body: `Iron Maiden: Legacy of the Beast is Keith Elwin's first ever design for Stern Pinball. Using graphics and cutscenes from the video game of the same name, Iron Maiden puts the player in the role of Eddie, battling against other Eddies, collecting their cards, and finding treasure along the way. This table may have a unique layout, but the rules are accessible for everyone from novices to more advanced pinball players.

**Design Team:**
- Lead Designer: Keith Elwin
- Code/Rules: Rick Naegele and Keith Elwin
- Lead Mechanical Engineer: Harrison Drake
- Artwork: Zombie Yeti
- Display and Animations: Zak Stark
- Music and Sound: Jerry Thompson
- Release Date: March 2018

**Game Concept:**
Players take on the role of Eddie, Iron Maiden's iconic mascot, battling against other Eddies, collecting their cards, and finding treasure along the way. The game features extensive use of graphics and cutscenes from the Iron Maiden: Legacy of the Beast video game.

**Modes of Play:**
- **Standard**: Full rulesheet gameplay
- **Competition**: Same as Standard but with elements of randomness removed
- **DJ Mixer**: Jukebox mode for playing Iron Maiden music and playlists

**Song Choice:**
At the start of each ball, you can select your soundtrack of choice. This is cosmetic only and doesn't affect gameplay. On subsequent balls, the chosen song continues from when you drained, unless you cycle through other songs before plunging.`,
        order_idx: 1,
        facts: {
          designer: 'Keith Elwin',
          manufacturer: 'Stern Pinball',
          year: 2018,
          system: 'SPIKE 2',
          theme: 'Iron Maiden / Heavy Metal',
          first_design: 'Keith Elwin\'s first Stern design',
          based_on: 'Iron Maiden: Legacy of the Beast video game',
          play_modes: 3
        }
      },
      {
        title: 'Skill Shots',
        section_type: 'skill_shot',
        body: `**Standard Skill Shot:**
Soft plunge into the skill shot target to score:
- 1M points
- +1 EDDIE letter
- +5 seconds of ball saver time

**Super Skill Shot:**
Hold the left flipper and plunge to the inner orbit. The ball will roll back down to the upper flipper. Shoot the Super Jackpot target to score:
- 5M points
- A lit Playfield X
- +10 seconds of ball saver time

**Secret Skill Shots:**
There are at least three Secret Skill Shots available, though their specific requirements are not fully documented.

**Strategic Value:**
The Super Skill Shot is particularly valuable as it immediately qualifies Playfield X, which can be used to multiply other scoring opportunities throughout the ball. The additional ball saver time from both skill shots provides crucial early-ball protection.`,
        order_idx: 2,
        facts: {
          standard_value: '1M + EDDIE letter + 5s ball save',
          super_value: '5M + Playfield X + 10s ball save',
          super_technique: 'hold left flipper, plunge to inner orbit',
          secret_shots: 3,
          playfield_x_qualification: 'Super Skill Shot instantly qualifies'
        }
      },
      {
        title: 'Eddie Battles System',
        section_type: 'modes',
        body: `**Qualifying Eddie Battles:**
Qualify one of the five Eddie Battle modes by shooting white arrows to spell EDDIE. Once EDDIE is completely spelled out, the "Battle" insert lights at the Pharaoh center ramp shot – shoot it to start the flashing mode.

**Mode Selection:**
- You are spotted two EDDIE letters toward your first mode
- If EDDIE is not yet fully spelled, shooting the left spinner changes the flashing mode
- Once EDDIE is completed, the flashing mode is locked in and cannot be changed
- You cannot replay a previously played mode until after playing all five modes plus 2 Minutes to Midnight

**Difficulty Progression:**
As you complete modes, subsequent modes become harder to qualify by:
- Reducing the number of white arrows available to spell EDDIE
- Not spotting any free letters
- Eventually capping out at 2 random lit shots that change when hit

**Mode Stacking:**
- Single-ball modes can be stacked with either Trooper or Mummy Multiball (if mode started prior to multiball)
- 2-ball Eddie Battles are mutually exclusive and cannot be stacked with any other multiball
- You cannot make progress toward your next mode while your current mode is being played

**Soul Shards:**
Winning any Eddie Battle lights the bullseye target to score a Soul Shard. Playing all five Eddie Battles qualifies the sixth Eddie Battle: **2 Minutes to Midnight**.

**The Five Eddie Battles:**
1. **Aces High** - 2-ball fighter pilot multiball
2. **Fear of the Dark** - Purple arrow spinner mode
3. **Rime of the Ancient Mariner** - 2-ball mariner multiball with moving shots
4. **Hallowed Be Thy Name** - Timed sequence mode
5. **Flight of Icarus** - Alternating ramp combo mode`,
        order_idx: 3,
        facts: {
          total_battles: 5,
          qualification: 'spell EDDIE with white arrows',
          starting_letters: 2,
          mode_selection: 'left spinner changes flashing mode',
          stacking_allowed: 'single-ball modes with multiballs',
          wizard_mode: '2 Minutes to Midnight',
          soul_shard_requirement: 'win any Eddie Battle'
        }
      },
      {
        title: 'Aces High Battle',
        section_type: 'mode',
        body: `**Mode Type:** 2-ball Multiball Eddie Battle

**Objective:** Aerial combat - defeat fighters, bombers, and the ace pilot.

**Stage 1 - Fighters:**
Every blue shot defeats a fighter. Defeat four fighters at any eight major shots to move onto stage 2.

**Stage 2 - Bombers:**
Defeat the two bombers by shooting either ramp, then the bullseye target. Repeat this sequence for both ramps (both bombers must be defeated).

**Stage 3 - The Ace:**
Defeat the ace by shooting the strobing shot, followed by the bullseye target within 5 seconds. This final jackpot is multiplied by the bullseye target position and qualifies the Soul Shard.

**Add-a-Ball:**
One add-a-ball is available from the first Mystery Award collected during the multiball.

**Special Condition:**
If the player is doing very poorly by their 3rd ball, this will always be the first battle played and cannot be changed like it normally can.

**Strategy:**
Focus on hitting the blue shots efficiently in Stage 1, then practice the ramp-to-bullseye timing for Stage 2. The final ace battle requires precise timing and bullseye accuracy for maximum scoring.`,
        order_idx: 4,
        facts: {
          type: '2-ball multiball',
          theme: 'aerial combat',
          stages: 3,
          stage_1: '4 fighters at 8 major shots',
          stage_2: '2 bombers via ramp-bullseye sequence',
          stage_3: 'ace via strobing shot + bullseye (5s timer)',
          add_ball: 'first Mystery Award',
          failsafe: 'forced first battle if struggling'
        }
      },
      {
        title: 'Fear of the Dark Battle',
        section_type: 'mode',
        body: `**Mode Type:** Single-ball Eddie Battle

**Objective:** Score massive spinner points by lighting and ripping spinners.

**Mechanics:**
Four shots are lit with purple arrows. Shoot any one of them to light the two spinners for massive points for one spinner rip:
- The REVIVE spinner scores 2x the displayed value
- The right ramp adds an additional +2x to spinners if shot before making either spinner
- The more difficult the shot, the higher the base spinner value

**Spinner Scoring:**
When you rip a lit spinner, it will unlight after it stops spinning and is no longer available for the lit spinner points. You may get BOTH spinners going during one "rip" - this awards 4x scoring for the left spinner, but it's very difficult to execute.

**Completion:**
Repeat the process three times to win the mode and light the Soul Shard.

**Strategy:**
- Choose purple arrow shots based on difficulty vs. spinner value reward
- Try to hit the right ramp before hitting spinners for the additional multiplier
- Attempt the double-spinner technique for maximum scoring, but be prepared for the difficulty
- Focus on consistent execution rather than risky maximum-value attempts`,
        order_idx: 5,
        facts: {
          type: 'single-ball',
          theme: 'darkness/fear',
          purple_arrows: 4,
          spinner_multipliers: '2x REVIVE, +2x from right ramp',
          double_spinner: '4x left spinner (very difficult)',
          completion_requirement: '3 cycles',
          difficulty_scaling: 'harder shots = higher spinner values'
        }
      },
      {
        title: 'Rime of the Ancient Mariner Battle',
        section_type: 'mode',
        body: `**Mode Type:** 2-ball Multiball Eddie Battle

**Objective:** Navigate the cursed mariner's journey with moving shots.

**Starting Phase:**
Center shot is lit to shoot down the albatross and collect a hurry-up counting down from 1M. Shoot center shot to lock in this value as the shot value and start a 2-ball multiball.

**Left Side Sequence:**
Shoot either of the two shots on the left side of the playfield (for the shot value + 500K increment) to move them by one shot towards the center for 20 seconds. Shoot the bullseye (or scoop under center ramp) once the shots are centered to score the jackpot worth the total shot values.

**Right Side Sequence:**
Repeat the same process for the right side of the playfield, including the drop targets, to qualify the Soul Shard.

**Add-a-Ball:**
One add-a-ball is available from the first Mystery Award collected during the multiball.

**Strategy:**
- Lock in a good hurry-up value at the start by timing the center shot well
- Learn the timing of the moving shots - they center for only 20 seconds
- Plan your shots efficiently to maximize the jackpot values
- Use the scoop under center ramp as an alternative to the bullseye target

**Literary Reference:**
Based on Samuel Taylor Coleridge's famous poem about a cursed mariner who must tell his tale to others.`,
        order_idx: 6,
        facts: {
          type: '2-ball multiball',
          theme: 'cursed mariner/albatross',
          starting_hurry_up: '1M countdown',
          shot_movement: 'toward center for 20 seconds',
          increment_value: '500K per shot',
          completion: 'both left and right side sequences',
          add_ball: 'first Mystery Award',
          alternative_target: 'scoop under center ramp'
        }
      },
      {
        title: 'Hallowed Be Thy Name Battle',
        section_type: 'mode',
        body: `**Mode Type:** Single-ball Eddie Battle

**Objective:** Complete the lit shots in order as quickly as possible.

**Shot Sequence:**
1. **Orange arrow** (3M) - Four orange arrow shots lit at start (both ramps and both orbits)
2. **Captive ball** (5M)
3. **Orange arrow** (3M)
4. **All three drop targets** (10M)
5. **Orange arrow** (3M)
6. **Bullseye target** (10M + 1M per time remaining + lights the Soul Shard)

**Mechanics:**
- Shooting any orange arrow unlights it for the remainder of the mode
- Must complete shots in the exact order shown
- Time remaining bonus adds significant value to the final shot
- Mode emphasizes speed and accuracy

**Strategy:**
- Plan your orange arrow shots - once hit, they're unavailable for the rest of the mode
- Practice the captive ball shot for consistency
- Complete drop targets efficiently (can be done in any order)
- Prioritize speed to maximize the time bonus on the final bullseye shot
- Learn the most efficient routes between required shots

**Song Reference:**
Based on Iron Maiden's epic song about facing death and judgment, emphasizing the urgency and finality of the sequence.`,
        order_idx: 7,
        facts: {
          type: 'single-ball',
          theme: 'death/judgment',
          sequence_length: 6,
          orange_arrows: '4 shots (both ramps, both orbits)',
          one_time_shots: 'orange arrows unlight when hit',
          time_bonus: '1M per second remaining',
          final_value: '10M + time bonus',
          emphasis: 'speed and accuracy'
        }
      },
      {
        title: 'Flight of Icarus Battle',
        section_type: 'mode',
        body: `**Mode Type:** Single-ball Eddie Battle

**Objective:** Build scoring through alternating ramp combos, with risk/reward mechanics.

**Basic Mechanics:**
Shoot alternating lit ramps for 2M (+150K increment for each ramp shot, lit or unlit).

**Combo System:**
Combo ramps on a 5-second timer for incremental multiplied scoring:
- 1st combo: 2x scoring
- 2nd combo: 3x scoring
- Continues incrementally
- The multiplied value is factored in after the 150K increment is added
- Shooting the same ramp within the 5-second combo timer will reset that timer

**Risk/Reward Mechanic:**
Once you've earned the 20M points required to qualify the Soul Shard, you have two options:
1. **Play it safe**: Shoot the bullseye target to end the mode early and light the Soul Shard
2. **Risk it**: Continue playing for higher scores, but risk losing everything if you drain

**Strategy:**
- Focus on clean alternating ramp shots to build the combo multiplier
- Monitor your total score - once you hit 20M, decide whether to cash out or continue
- Practice ramp-to-ramp flow for consistent combo timing
- Consider your ball control and remaining ball time when deciding to risk it
- The mode rewards both technical skill and strategic decision-making

**Mythological Reference:**
Based on the Greek myth of Icarus, who flew too close to the sun - reflecting the risk/reward nature of the mode.`,
        order_idx: 8,
        facts: {
          type: 'single-ball',
          theme: 'Greek mythology/flight',
          base_scoring: '2M + 150K increments',
          combo_timer: '5 seconds',
          combo_multipliers: '2x, 3x, etc.',
          qualification_threshold: '20M points',
          risk_reward: 'cash out early or continue for more',
          strategy_element: 'decision making under pressure'
        }
      },
      {
        title: 'Soul Shards System',
        section_type: 'collection',
        body: `**Collecting Soul Shards:**
Completing any Eddie battle mode will light the bullseye target for 10 seconds to collect a Soul Shard. The Soul Shard is worth a hurry-up starting at 20% of the points earned during the battle, multiplied by 2x or 3x depending on the position of the bullseye target hit.

**Collection Requirements:**
- Shoot the bullseye target within 10 seconds (regardless of starting hurry-up value)
- If you drain or if the hurry-up expires, you do not get credit for the Soul Shard
- Grace period caveat: If you collect the final shot of a mode during the mode's grace period, you will not start the Soul Shard hurry-up sequence

**Soul Shard Benefits:**
1. **Increase end-of-ball bonus** (250K per shard)
2. **Light Tomb Treasures** (one treasure per unique shard)
3. **Added to "mode scores"** during 2 Minutes to Midnight
4. **Increase bonus awarded** for winning Number of the Beast
5. **Mystery Award**: After playing 2 Minutes to Midnight, the next level 3 Mystery award will spot a Soul Shard that hasn't been collected yet (if any remain)

**Strategic Importance:**
Soul Shards are crucial for:
- Accessing Tomb Treasures (which lead to Run to the Hills)
- Maximizing scoring in 2 Minutes to Midnight
- Building substantial end-of-ball bonus
- Qualifying and enhancing Number of the Beast wizard mode

**Collection Tips:**
- Practice bullseye accuracy under pressure
- Be aware of the 10-second timer
- Position matters - center bullseye hits provide maximum multiplier
- Don't attempt Soul Shard collection if ball control is poor`,
        order_idx: 9,
        facts: {
          collection_window: '10 seconds',
          base_value: '20% of battle points',
          multipliers: '2x or 3x based on bullseye position',
          bonus_value: '250K per shard',
          tomb_treasure_source: 'one per unique shard',
          mystery_award: 'level 3 after 2MTM',
          grace_period_caveat: 'no shard if final shot in grace period'
        }
      },
      {
        title: '2 Minutes to Midnight (6th Eddie Battle)',
        section_type: 'wizard_mode',
        body: `**Mode Type:** Single-ball Timed Eddie Battle / Mini-Wizard Mode

**Qualification:** Play all five Eddie battles to qualify this 6th Eddie battle.

**Timer Mechanics:**
- Mode starts with generous initial ball-save time
- Timer counts up to midnight, starting at "2 minutes to midnight"
- Timer counts at double speed, making effective mode time 60 seconds
- If timer reaches midnight, the mode ends
- Shooting any "X" standup target adds 5 seconds to timer (one time only)
- Playfield X can only be activated if one was qualified prior to starting the mode

**Scoring System:**
At the start, 5 major shots are lit (corresponding to each completed mode) for:
**1M + 15% of the total points earned from the respective mode & its corresponding Soul Shard**

**Super Jackpot Mechanics:**
- Collect all lit shots once to light super jackpot at the Super Jackpot target
- Super jackpot worth the value of all shots combined
- Each lit shot extinguishes after being collected
- Shots only relight once all shots have been made
- Collecting all lit shots adds +1x to Super Jackpot multiplier (if already lit)
- Multiplier resets after super jackpot is scored
- Super jackpot value only resets at the end of the mode

**Eddie Card Rewards:**
- Starting 2MTM immediately awards **Soldier Eddie card at level 1**
- Scoring a **2x Super Jackpot** awards **Soldier Eddie card at level 2**

**Mode Reset:**
After 2 Minutes to Midnight, the Eddie Battle modes reset and can be played again, but the difficulty of spotting EDDIE letters the 2nd+ time around does not reset.`,
        order_idx: 10,
        facts: {
          qualification: 'complete all 5 Eddie battles',
          effective_duration: '60 seconds (double speed timer)',
          time_extension: '5 seconds per X target (once only)',
          shot_value: '1M + 15% of mode + Soul Shard points',
          super_jackpot_multiplier: '+1x per shot cycle',
          soldier_eddie_l1: 'awarded for starting mode',
          soldier_eddie_l2: 'awarded for 2x Super Jackpot',
          mode_reset: 'battles reset after completion'
        }
      },
      {
        title: 'Power Features System',
        section_type: 'progression',
        body: `**Power Feature Types:**
Make shots around the playfield many times to enable Power Features:
1. **Power Spinners**
2. **Power Orbits**
3. **Power Ramps**
4. **Power Targets**
5. **Power Bumpers**

**Activation Process:**
- The remaining hits to activate each power feature are displayed on the left side of the screen on gray icons
- Once a Power Feature is activated, that feature's screen icon changes to color with a new decreasing counter
- The feature's yellow triangle insert on the playfield begins flashing
- Score more hits on each activated feature to build the Power Jackpot base value by +3M per feature
- Decrease the activated feature's counter to zero to complete the Power Feature

**Power Jackpot:**
Once any of the five Power Features are completed:
- Power Jackpot becomes available to cash in at the Orb target
- That feature's yellow triangle insert begins pulsing
- Base value increases by +3M per completed Power Feature

**Cyborg Multiball Qualification:**
Complete all five Power Features to light the bullseye target for **Cyborg Multiball**.

**Power Feature Reset:**
After completing Cyborg Multiball, the Power Features reset and increase in value and difficulty.

**Strategic Value:**
- Power Features provide consistent progression goals throughout the game
- Each completed feature contributes significantly to Power Jackpot value
- The system encourages varied shot-making across all playfield features
- Completing all five features unlocks one of the game's major multiballs`,
        order_idx: 11,
        facts: {
          feature_count: 5,
          jackpot_increase: '3M per completed feature',
          visual_indicator: 'gray to color icons, flashing yellow triangles',
          qualification_target: 'Cyborg Multiball',
          reset_condition: 'after Cyborg Multiball completion',
          difficulty_increase: 'value and difficulty increase after reset',
          orb_target: 'Power Jackpot collection point'
        }
      },
      {
        title: 'Power Jackpot System',
        section_type: 'jackpot',
        body: `**Base Value Building:**
The Power Jackpot base value increases by +3M for each completed Power Feature.

**Value Multipliers:**
There are many ways to increase or multiply the Power Jackpot value:

**Direct Additions:**
- Completing any Power Feature: +3M
- Tomb Treasure #3: +15M (if Can I Play With Madness is disabled)
- Collect a Level 1 Eddie Card: +5M
- Collect a Level 2 Eddie Card: +15M

**Multiplier Increases:**
- Completing another Power Feature while Power Jackpot is already lit: +1x
- Mystery Award: +1x
- Tomb Treasure #8: +5x

**Playfield Multiplier:**
Like all other scoring in Iron Maiden, the Power Jackpot can be further multiplied by activating Playfield X before collecting it.

**Collection:**
The Power Jackpot is collected at the Orb target when any Power Feature is completed (indicated by pulsing yellow triangle inserts).

**Strategic Considerations:**
- Plan Power Feature completions to maximize multiplier stacking
- Save Playfield X activation for Power Jackpot collection when possible
- Consider timing Eddie Card collection to boost Power Jackpot value
- Level 2 Eddie Cards provide 3x the value boost of Level 1 cards
- The +5x multiplier from Tomb Treasure #8 can create massive scoring opportunities

**Maximum Potential:**
With proper planning, Power Jackpots can reach extremely high values through strategic multiplier stacking and Playfield X activation.`,
        order_idx: 12,
        facts: {
          base_increase: '3M per Power Feature',
          level_1_card_bonus: '5M',
          level_2_card_bonus: '15M',
          tomb_treasure_3: '15M (if CIPWM disabled)',
          tomb_treasure_8: '5x multiplier',
          mystery_multiplier: '1x',
          feature_completion_multiplier: '1x',
          playfield_x_compatible: 'yes',
          collection_point: 'Orb target'
        }
      },
      {
        title: 'Cyborg Multiball',
        section_type: 'multiball',
        body: `**Qualification:** Complete all five Power Features to qualify Cyborg Multiball at the bullseye target/center ramp.

**Multiball Mechanics:**
During Cyborg Multiball, light all of the Power Feature inserts by hitting their corresponding features each at least once to light the Super Jackpot at the Orb.

**Super Jackpot System:**
- Super Jackpot value determined by shots collected prior, starting at 4M
- Value only resets at the end of the multiball
- Collecting a Super Jackpot increases the multiplier for subsequent Super Jackpots by +1x
- First two Super Jackpots during the multiball add-a-ball
- Multiplier resets to 1x at the end of the multiball

**Playfield X Interaction:**
As the X targets play a role in lighting the super jackpot, Playfield X can only be activated during the multiball by bringing one into it (qualifying it before the multiball starts).

**Eddie Card Rewards:**
- Starting Cyborg Multiball lights the **Cyborg Eddie card at level 1**
- Scoring a **5x Super Jackpot** nets the **Cyborg Eddie card at level 2**

**Power Feature Reset:**
After completing Cyborg Multiball, the Power Features reset and increase in value and difficulty.

**Strategy:**
- Bring Playfield X into the multiball for maximum scoring potential
- Focus on lighting all Power Feature inserts quickly to enable Super Jackpots
- The first two Super Jackpots provide add-a-balls, so prioritize collecting them
- Build toward the 5x Super Jackpot for the Level 2 Cyborg Eddie card
- Plan shot sequences to maintain multiball while progressing toward Super Jackpots`,
        order_idx: 13,
        facts: {
          qualification: 'complete all 5 Power Features',
          super_jackpot_start: '4M',
          multiplier_increase: '1x per Super Jackpot',
          add_balls: 'first 2 Super Jackpots',
          cyborg_eddie_l1: 'start multiball',
          cyborg_eddie_l2: '5x Super Jackpot',
          playfield_x_requirement: 'must bring into multiball',
          reset_effect: 'Power Features increase difficulty'
        }
      },
      {
        title: 'Trooper Multiball',
        section_type: 'multiball',
        body: `**Qualification:**
1. Complete drop targets when "Light Lock" is flashing (two completions the first time)
2. Light all 3 locks at the orbits
3. Hit green arrow orbit shots to virtually lock balls
4. For first multiball: both left orbit and right loop are lit to lock
5. For subsequent multiballs: each Lite Lock award only lights one ball lock
6. Lock 3 balls to start Trooper Multiball

**Multiball Structure:**
- 3-ball multiball (4-ball if Mummy Multiball was lit and third lock collected after grazing captive ball)
- At start, all shots are lit in blue for 1x jackpot
- Shots unlight when collected

**Jackpot Progression:**
- Collecting 3 jackpots lights the first Super Jackpot at the corresponding target
- Scoring Super Jackpot relights collected jackpots with +1x scoring
- Uncollected shots remain lit at their previous scoring level
- Jackpot color progression: BGYOR (Blue, Green, Yellow, Orange, Red)
- Collecting all lit jackpots resets all jackpots to next multiplier level

**Cannon Feature:**
- Complete drop targets during Trooper Multiball to light bullseye target to fire the cannon
- Cannon indicated by rainbow flashing arrow
- Multiple cannon shots possible per multiball
- After collecting one cannon shot, need to collect Super Jackpot before lighting another
- Firing cannon scores 1-3 lit jackpots based on bullseye target position hit
- First cannon shot collected adds a ball

**Eddie Card Rewards:**
- Collecting Super Jackpot awards **Trooper Eddie card at level 1**
- **Level 2 card** awarded by either:
  - Advancing all jackpots to 3x (yellow), OR
  - Scoring a single 5x (red) jackpot

**Persistence:**
All shots' jackpot levels carry over between Trooper multiballs.`,
        order_idx: 14,
        facts: {
          qualification_first: '2 drop target completions',
          qualification_subsequent: '1 completion per lock',
          ball_count: '3-ball (4 with Mummy MB)',
          jackpot_colors: 'BGYOR progression',
          super_jackpot_requirement: '3 jackpots',
          cannon_requirement: 'drop targets',
          cannon_scoring: '1-3 jackpots based on position',
          trooper_eddie_l1: 'Super Jackpot',
          trooper_eddie_l2: 'all 3x or single 5x jackpot',
          persistence: 'jackpot levels carry over'
        }
      },
      {
        title: 'Mummy Multiball',
        section_type: 'multiball',
        body: `**Qualification Phase 1 - Lock:**
- Shoot Sarcophagus captive ball twice (5 times for subsequent multiballs)
- This lights the Mummy Lock (center ramp on Pro, left ramp on Prem/LE)
- Lock the ball to proceed to Phase 2

**Qualification Phase 2 - Spell MUMMY:**
- After locking ball, spell MUMMY at the captive ball with five more shots
- Third and subsequent Mummy Multiballs require two hits per MUMMY letter
- Mummy Multiball starts on the next captive ball hit after spelling MUMMY

**Multiball Mechanics:**
Qualify jackpots at the captive ball by scoring:
- **10 switch hits + 10 per jackpot** (switch hit threshold increases with each jackpot)
- Jackpot qualifications cannot be stacked
- Each jackpot spots a MUMMY letter
- On Prem/LE: lights left ramp for double switch hits + another jackpot at captive ball (2x if switch hit threshold was reached)

**Super Jackpot:**
- Spell MUMMY to light Super Jackpot at bullseye target
- Super Jackpot multiplied depending on target hit position
- For subsequent jackpot rounds, values are doubled
- Only shooting captive ball when corresponding MUMMY letter is lit will score a jackpot

**Add-a-Ball System:**
Add-a-balls available by completing all yellow shots at given levels (limited to 3 add-a-balls per multiball):
1. **Level 1:** Both ramps
2. **Level 2:** Both ramps and both orbits  
3. **Level 3+:** Both ramps, both orbits, both loops, center ramp, and Super Jackpot target

**Eddie Card Rewards:**
- Score first Super Jackpot: **Mummy Eddie card at level 1**
- Score second Super Jackpot (doesn't have to be same multiball): **Mummy Eddie card at level 2**

**Persistence:**
- MUMMY letter progress toward Super Jackpot carries over between multiballs
- Switch hit progress within a letter does NOT carry over
- Add-a-ball progress carries over between attempts`,
        order_idx: 15,
        facts: {
          captive_ball_first: '2 hits to light lock',
          captive_ball_subsequent: '5 hits to light lock',
          mummy_spelling: '5 shots (2 per letter on 3rd+)',
          switch_hit_base: '10 + 10 per jackpot',
          add_ball_levels: 3,
          max_add_balls: '3 per multiball',
          mummy_eddie_l1: 'first Super Jackpot',
          mummy_eddie_l2: 'second Super Jackpot',
          letter_persistence: 'MUMMY progress carries over',
          switch_persistence: 'switch hits do NOT carry over'
        }
      },
      {
        title: 'Eddie Cards System',
        section_type: 'collection',
        body: `**Eddie Card Types:**
There are 4 Eddie Cards that must be collected to qualify Number of the Beast:
1. **Mummy Eddie**
2. **Cyborg Eddie**
3. **Trooper Eddie**
4. **Soldier Eddie**

**Card Levels:**
Each card has two levels with different benefits and requirements:

**Level 1 Cards:**
- Add +5M to Power Jackpot value each
- Vanish at the end of a failed Number of the Beast attempt
- Easier to obtain

**Level 2 Cards:**
- Add +15M to Power Jackpot value each (3x more than Level 1)
- Retained across Number of the Beast attempts
- Tougher to obtain
- Light a Tomb Treasure if all four have been collected at Level 2

**Card Requirements:**

| Card | Level 1 | Level 2 |
|------|---------|---------|
| **Mummy Eddie** | Mummy MB Super Jackpot | Mummy MB 2nd Super Jackpot (per game) |
| **Cyborg Eddie** | Start Cyborg MB | Cyborg MB 5x Super Jackpot |
| **Trooper Eddie** | Trooper MB Super Jackpot | Trooper MB All Jackpots at 3x OR 5x Jackpot |
| **Soldier Eddie** | Start 2 Minutes to Midnight | 2 Minutes to Midnight 2x Super Jackpot |

**Strategic Importance:**
- Required to qualify Number of the Beast wizard mode
- Significant Power Jackpot value increases
- Level 2 cards provide insurance against wizard mode failure
- Collecting all Level 2 cards lights a Tomb Treasure
- End-of-ball bonus: 250K per card (Level 2 cards count as two cards for bonus)

**Collection Strategy:**
Focus on Level 2 cards when possible, as they provide better insurance and higher Power Jackpot values.`,
        order_idx: 16,
        facts: {
          total_cards: 4,
          level_1_power_jackpot: '5M each',
          level_2_power_jackpot: '15M each',
          level_1_persistence: 'lost on failed wizard mode',
          level_2_persistence: 'retained across attempts',
          all_level_2_bonus: 'lights Tomb Treasure',
          bonus_value: '250K per card (L2 = 2 cards)',
          wizard_mode_requirement: 'all 4 cards at any level'
        }
      },
      {
        title: 'Number of the Beast (Wizard Mode)',
        section_type: 'wizard_mode',
        body: `**Qualification:** Collect all 4 Eddie Cards at either Level 1 or Level 2.

**Mode Structure:**
This is an untimed single-ball mode with a 30-second initial ball save.

**Battle Mechanics:**
1. **Enable Counter-Attacks:** Three shots are lit with red arrows - shoot any one to light the bullseye target
2. **Bullseye Target:** Must be hit within 5 seconds to enable counter-attacks
3. **Counter-Attack Phase:** After bullseye hit, all shots are lit yellow for 10 seconds to score counter-attacks against the Beast
4. **Shot Restrictions:** You cannot shoot the same shot consecutively
5. **Victory Condition:** 15 counter-attack shots are required to defeat the Beast
6. **Phase Repetition:** You can re-qualify and repeat the counter-attack phase as needed

**Failure Consequences:**
If you lose your ball:
- You lose your battle against the Beast
- Must re-qualify all 4 Eddie Cards that haven't been advanced to Level 2
- If you have all four Level 2 Eddie Cards, you immediately get to rematch the Beast (if you have another ball)

**Victory Rewards:**
Defeating the Beast:
- Disables the flippers and drains your ball
- Awards **100M plus the values of any Soul Shards** collected earlier
- Normal gameplay resumes on current ball with fresh ball saver
- Beast cannot be challenged again until **Run to the Hills** has been played

**Strategic Considerations:**
- Level 2 Eddie Cards provide insurance against failure
- Soul Shard collection significantly increases victory bonus
- Practice bullseye accuracy for the 5-second window
- Plan counter-attack shots to avoid consecutive repeats
- The 30-second ball saver provides safety for the opening phase

**Beast Reference:**
Based on Iron Maiden's iconic song "The Number of the Beast" and the biblical reference to 666.`,
        order_idx: 17,
        facts: {
          qualification: 'all 4 Eddie Cards (any level)',
          ball_save: '30 seconds initial',
          red_arrows: '3 shots to enable counter-attacks',
          bullseye_window: '5 seconds',
          counter_attack_window: '10 seconds',
          required_shots: '15 counter-attacks',
          consecutive_restriction: 'cannot repeat same shot',
          victory_bonus: '100M + Soul Shard values',
          level_2_insurance: 'immediate rematch if all L2',
          replay_restriction: 'cannot rechallenge until Run to the Hills'
        }
      },
      {
        title: 'Tomb Treasures System',
        section_type: 'progression',
        body: `**Collection:** Complete various objectives throughout the game to light the Tomb (Pro: right loop, Prem/LE: left ramp) to collect a Tomb Treasure.

**Treasure Order (10 treasures total):**
1. **15M** points
2. **Super Slings** (slingshots worth 250K + 1K increment for rest of ball)
3. **Boost Power Jackpot +15M** OR **Can I Play With Madness** (if enabled)
4. **Super Combos** (5x combos and deathblows for rest of ball)
5. **Light Extra Ball**
6. **Light Revive** (wasted if Revive already lit)
7. **Collect 2X Bonus**
8. **+5x Power Jackpot**
9. **50M + spots a random Level 2 Eddie card**
10. **Run to the Hills** (Super Wizard Mode)

**Qualifying Objectives (11 total, need 10 for Run to the Hills):**
- **Collect a Soul Shard** after winning any Eddie battle mode (one treasure per unique shard - 5 possible)
- **Score a Loop Jackpot**
- **Score a 6-Way Combo**
- **Mummy MB Super Jackpot**
- **Trooper MB Super Jackpot**
- **Win Number of the Beast**
- **Collect all 4 Level 2 Eddie cards**

**Important Notes:**
- There are exactly 11 different objectives, but only 10 treasures
- Repeating the same objective twice will NOT light another treasure
- You need to complete 10 different goals to start Run to the Hills
- Can I Play With Madness (treasure #3) is only available on Prem/LE or with Insider Connected enabled

**Strategic Planning:**
Since there are 11 objectives but only 10 treasures needed, you have one "extra" objective. Plan your approach based on which objectives are most achievable for your skill level.`,
        order_idx: 18,
        facts: {
          total_treasures: 10,
          qualifying_objectives: 11,
          soul_shard_max: '5 treasures (one per unique shard)',
          super_wizard_requirement: '10th treasure',
          repetition_rule: 'same objective twice does not count',
          treasure_3_requirement: 'Prem/LE or Insider Connected',
          power_jackpot_boosts: 'treasure 3 (+15M), treasure 8 (+5x)',
          extra_ball: 'treasure 5',
          level_2_spot: 'treasure 9 (random card)'
        }
      },
      {
        title: 'Can I Play With Madness Multiball',
        section_type: 'multiball',
        body: `**Availability:** Started as the 3rd Tomb Treasure on Prem/LE models and models with Insider Connected enabled. Can be disabled as a settings adjustment.

**Starting Mechanics:**
- Starts as a 2-ball multiball
- One lit red shot that can be moved around the playfield:
  - Right flipper moves the lit shot to the right side of playfield
  - Left flipper moves the lit shot to the left side of playfield

**Progression System:**
1. **Phase 1:** Make the lit red shot to add a ball and light 2 moving red shots
2. **Phase 2:** Shoot red shots to turn them green, but avoid shooting them again (they revert to red)
3. **Shot Locking:** Shoot the orb to lock in lit shots for 10 seconds
4. **Ball Addition:** Turn all red shots green to add another ball into play
5. **Cycle Continuation:** Rinse and repeat until multiball ends

**Premium/LE Feature:**
On Prem/LE models, shooting the scoop under the center ramp when lit green will temporarily hold the ball.

**Strategic Approach:**
- Use flipper buttons strategically to position the lit shot where you want it
- Focus on turning red shots green without accidentally hitting them again
- Use the orb to lock in progress when you have multiple green shots
- The scoop feature on Prem/LE provides additional ball control options
- Build up green shots before using the orb for maximum efficiency

**Song Reference:**
Based on Iron Maiden's song of the same name, featuring themes of mental instability and confusion, reflected in the chaotic moving shot mechanics.

**Multiball Management:**
This is one of the more complex multiballs due to the moving shot mechanics and the need to avoid re-hitting converted shots.`,
        order_idx: 19,
        facts: {
          availability: 'Prem/LE or Insider Connected',
          starting_balls: 2,
          shot_movement: 'controlled by flipper buttons',
          conversion_mechanic: 'red to green shots',
          reversion_risk: 'green shots turn red if hit again',
          orb_function: 'locks shots for 10 seconds',
          ball_addition: 'turn all red to green',
          premium_feature: 'scoop under center ramp holds ball',
          complexity: 'moving shots + conversion tracking'
        }
      },
      {
        title: 'Run to the Hills (Super Wizard Mode)',
        section_type: 'super_wizard_mode',
        body: `**Qualification:** Collect the 10th Tomb Treasure to begin this elusive 6-ball multiball wizard mode.

**Mode Structure:**
- 6-ball multiball (highest ball count in the game)
- Starts with generous ball save
- Hybrid of Cyborg and Trooper Multiball rules

**Scoring System:**
- All shots are persistently lit for jackpots
- Collect one of each Power feature in order (top-left to bottom-right) to light Super Jackpot at center ramp
- Collecting Super Jackpot adds +1x to all jackpots
- Jackpot values increase throughout the mode

**Ball Management:**
Spell MUMMY at captive ball to add balls into play, helping maintain the multiball.

**Game Reset After Completion:**
After starting Run to the Hills:
- Tomb Treasure progress resets
- All Soul Shards are cleared  
- All Eddie cards reset
- Game essentially starts fresh progression-wise

**Strategic Approach:**
- Focus on maintaining as many balls as possible
- Work systematically through Power features in the required order
- Use MUMMY spelling for ball additions when multiball count gets low
- Maximize jackpot collection before they reset
- This is the ultimate achievement in Iron Maiden pinball

**Song Reference:**
Based on Iron Maiden's classic song about escaping to freedom, representing the ultimate escape and achievement in the game.

**Rarity:**
This is one of the most difficult wizard modes to reach in modern Stern pinball, requiring mastery of virtually all game features and substantial endurance.`,
        order_idx: 20,
        facts: {
          qualification: '10th Tomb Treasure',
          ball_count: '6-ball multiball',
          rule_hybrid: 'Cyborg + Trooper Multiball',
          power_feature_order: 'top-left to bottom-right',
          super_jackpot_location: 'center ramp',
          jackpot_multiplier: '+1x per Super Jackpot',
          ball_addition: 'spell MUMMY at captive ball',
          game_reset: 'all progress cleared after completion',
          difficulty: 'extremely rare achievement'
        }
      },
      {
        title: 'Other Scoring Features',
        section_type: 'scoring',
        body: `**Drop Target Awards:**
Complete drop targets to collect flashing awards in the following order:
- **Adv. Bonus X** (maxes out at 50x)
- **Light Orb** 
- **Light Locks**

**Super Sweep:** Sweep all three drop targets in a single shot to collect 2x the drop target value (increased by hitting the Orb) and two awards at once.

**Award Skipping:** Awards can be skipped under certain circumstances:
- Adv. Bonus X disabled after reaching 50x
- Light Orb disabled after getting mystery award to level 3 (collect award to re-enable)
- Light Locks disabled if third lock is currently lit

**Loop Jackpot System:**
- Shoot either upper loop to increase value and eventually light Loop Jackpot
- Each loop scores lit value, adds to Loop Jackpot, increases by 250K (max 2.5M base)
- Lit loop value decreases over time back to 250K
- **Big Loop:** Scores 2x current loop value (without holding upper left flipper)
- **Mini-Loop:** Scores 3x current loop value, lights 2x Loop insert for 6 seconds
- **Loop Jackpot:** Enabled after 5 (+2) shots, worth total built value
- **Multiplier System:** +1x per shot up to 4x, then ball diverted to upper left flipper
- **Collection Window:** 12 seconds with multiplier building
- Loop Jackpot lights a Tomb Treasure; 30 loops (excluding jackpots) lights extra ball

**Playfield Multiplier:**
- Shoot flashing X targets to light return lane for 2x playfield scoring
- Complete X targets second time to qualify 3x Playfield
- Subsequent completions increase timer duration
- Qualified Playfield X carries between balls
- Base timer: 20 seconds, +5 seconds per flashing X target hit while active
- Alley passing through left inlane to Gravestone target spots flashing X target (when not in mode)

**Revive System:**
- Shoot left spinner to spell REVIVE and light outlanes for ball save
- First REVIVE: both outlanes light; subsequent: only one outlane
- Factory settings: each outlane used individually (effectively two Revives when both lit)
- Harder settings: using one outlane unlight both
- Cannot stack Revives; new letters cannot be spotted while both outlanes lit
- Lit Revives carry between balls; spinner scoring boosted when both lit`,
        order_idx: 21,
        facts: {
          drop_target_max_bonus: '50x',
          super_sweep: '2x value + 2 awards',
          loop_jackpot_max: '2.5M base',
          loop_multiplier_max: '4x',
          loop_extra_ball: '30 loops',
          playfield_x_max: '3x',
          playfield_x_timer: '20s base + 5s per X target',
          revive_outlanes: 'both first time, one subsequent',
          revive_persistence: 'carries between balls'
        }
      },
      {
        title: 'Combos & Deathblows',
        section_type: 'combos',
        body: `**Combo Mechanics:**
A "combo" is performed by hitting distinct shots on the playfield in succession. Unlike most games, an active combo does NOT "time out" - it continues indefinitely until ended.

**Shots That Count Towards Combos:**
1. Left Ramp
2. Big Loop  
3. Left Orbit
4. Mini Loop
5. Right Ramp
6. Right Orbit

**Combo Ending Conditions:**
A combo ends when one of the following occurs:
- A Deathblow has been scored
- A shot already used in the active combo is made again
- Any standup, drop target, or 2 pop bumpers are hit

**Combo Scoring:**
- Starts at 500K for a 2-way combo
- Increases exponentially with length
- Maximum possible: 6-Way Combo (lights a Tomb Treasure)
- Active combo indicator: lamp to the right of upper right flipper strobes

**Deathblows:**
Ending a combo by hitting certain shots/targets awards a Deathblow, scoring points based on combo length:

**Standard Deathblow Targets:**
- Extra Ball target
- Captive ball  
- Bullseye target

**Super Deathblow Targets (3x value):**
- Center of bullseye target
- Super Jackpot target
- REVIVE spinner

**Maximum Deathblow Value:**
The theoretical maximum Deathblow value is **900M**:
- 20M for 6-Way Combo
- x3 for Super Deathblow
- x3 with Playfield X  
- x5 with Super Combos (Tomb Treasure #4)

**Strategic Use:**
- Plan combo routes to maximize length before ending
- Save Super Deathblow targets for longest combos
- Use Super Combos Tomb Treasure for 5x multiplier
- Combine with Playfield X for maximum scoring potential
- Deathblows count toward end-of-ball bonus (45K each)`,
        order_idx: 22,
        facts: {
          combo_shots: 6,
          no_timeout: 'combos continue indefinitely',
          max_combo: '6-way (lights Tomb Treasure)',
          base_scoring: '500K for 2-way',
          deathblow_multiplier: '3x for Super targets',
          max_theoretical: '900M (6-way + Super + PFx + Super Combos)',
          bonus_value: '45K per deathblow',
          combo_indicator: 'upper right flipper lamp strobes'
        }
      },
      {
        title: 'Extra Balls & End-of-Ball Bonus',
        section_type: 'bonus',
        body: `**Extra Ball Sources:**
There are three ways to light extra balls, scored at the extra ball "X" target:
1. **Complete 3 Power Features**
2. **5th Tomb Treasure**  
3. **30 loops** (excluding Loop Jackpot shots)

**End-of-Ball Bonus Calculation:**
Bonus is calculated as follows, then multiplied by Bonus X:

**Base Scoring:**
- **Switches × 3,500** (all switch hits during the ball)
- **MUMMY Letters × 25,000** (progress toward Mummy Multiball)
- **Deathblows × 45,000** (combo endings)
- **Loops × 50,000** (upper loop shots)
- **Power Features Completed × 75,000** (each completed Power Feature)
- **Soul Shards Collected × 250,000** (Eddie Battle completions)
- **Eddie Cards Collected × 250,000** (Level 2 cards count as two cards for bonus)

**Bonus Multiplier:**
- Advanced through drop target awards
- Maximum of 50x multiplier
- Significantly amplifies all bonus categories

**Strategic Bonus Building:**
- Soul Shards and Eddie Cards provide the highest per-item bonus values
- Power Features completion contributes substantially
- Loop shots build consistent bonus throughout the ball
- Deathblows from combo play add significant value
- Switch hits provide the base foundation

**Bonus Optimization:**
- Focus on Soul Shard collection for maximum bonus impact
- Advance Eddie Cards to Level 2 when possible (double bonus value)
- Complete Power Features for 75K each
- Build Bonus X through drop target completions
- The 2X Bonus Tomb Treasure doubles the final bonus calculation

**Example High Bonus:**
With 50x Bonus multiplier, a single Soul Shard contributes 12.5M to the bonus (250K × 50x).`,
        order_idx: 23,
        facts: {
          extra_ball_sources: 3,
          extra_ball_target: 'X target',
          switch_value: '3,500 each',
          soul_shard_value: '250,000 each',
          eddie_card_value: '250,000 each (L2 = 2 cards)',
          power_feature_value: '75,000 each',
          loop_value: '50,000 each',
          deathblow_value: '45,000 each',
          mummy_letter_value: '25,000 each',
          max_bonus_x: '50x',
          double_bonus_treasure: '7th Tomb Treasure'
        }
      },
      {
        title: 'Advanced Strategies',
        section_type: 'strategy',
        body: `**Mode Stacking Strategies:**
The single-ball Eddie battles (Fear of the Dark, Hallowed Be Thy Name, and Flight of Icarus) can be stacked with either Trooper or Mummy Multiball if the battle is started during the multiball. This makes Soul Shard collection significantly easier.

**Optimal Stacks:**
- **Flight of Icarus + Mummy Multiball:** The ramp shots required for Mummy add-a-balls align perfectly with Flight of Icarus requirements
- **Hallowed Be Thy Name + Trooper Multiball:** Strong combination for consistent Soul Shard collection
- **Fear of the Dark + Either Multiball:** Spinner scoring becomes much safer during multiball

**Soul Shard Collection:**
- Soul Shards can also be collected as Level 3 Mystery awards after playing 2 Minutes to Midnight
- This provides a backup method when trying to reach Run to the Hills
- Focus on bullseye accuracy - the 10-second window is crucial
- Practice the timing and positioning for maximum multiplier hits

**REVIVE Safety:**
- Work on qualifying REVIVE during multiballs or with long ball saver active
- The left spinner is notoriously risky and can end balls quickly
- Having REVIVE lit provides crucial safety for aggressive play
- Both outlanes lit effectively gives you two extra chances

**Playfield Multiplier Optimization:**
- All Tomb Treasure awards are multiplied by Playfield Multipliers
- Why take 15M when you could take 45M with 3x Playfield?
- Save Playfield X activation for high-value collections:
  - Power Jackpots
  - Tomb Treasures  
  - Soul Shard hurry-ups
  - Super Jackpots

**Power Jackpot Maximization:**
- Plan Eddie Card collection timing to boost Power Jackpot values
- Stack multipliers from multiple completed Power Features
- Use Tomb Treasure #8 (+5x) for massive Power Jackpot values
- Combine with Playfield X for ultimate scoring

**Long-Term Progression:**
- Focus on Level 2 Eddie Cards for wizard mode insurance
- Build toward Run to the Hills through diverse Tomb Treasure objectives
- Master combo/deathblow system for consistent high scoring
- Learn multiball management for extended play and stacking opportunities`,
        order_idx: 24,
        facts: {
          stackable_modes: '3 single-ball Eddie battles',
          best_stacks: 'Flight of Icarus + Mummy MB, Hallowed + Trooper MB',
          soul_shard_backup: 'Level 3 Mystery after 2MTM',
          revive_strategy: 'qualify during multiball/ball save',
          playfield_x_targets: 'Tomb Treasures, Power Jackpots, Soul Shards',
          level_2_insurance: 'Eddie Cards provide wizard mode safety',
          combo_mastery: 'consistent high scoring method'
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

    console.log('🎉 Iron Maiden seeding completed successfully!');
    console.log(`📊 Added ${ruleSections.length} rule sections`);
    console.log('💡 Run "npm run reindex" to update Meilisearch with the new game');

  } catch (error) {
    console.error('❌ Error seeding Iron Maiden:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedIronMaiden().catch((err) => {
  console.error('❌ Iron Maiden seeding failed:', err);
  process.exit(1);
});
