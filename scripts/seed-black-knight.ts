import { getPool, query, createGame, createRuleset, createRuleSection, updateRuleSectionEmbedding } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

async function seedBlackKnight() {
  console.log('⚔️ Seeding Black Knight: Sword of Rage...');

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.length < 40) {
    console.warn('⚠️  OpenAI API key is not configured. Embeddings will be skipped.');
  }

  const client = getPool();

  try {
    // Insert the game
    const game = await createGame({
      title: 'Black Knight: Sword of Rage',
      manufacturer: 'Stern Pinball',
      year: 2019,
      system: 'SPIKE 2',
      ipdb_id: null, // TBD - need to look up
      pinside_id: null, // TBD - need to look up
    });

    console.log(`✅ Created game: ${game.id}`);

    // Insert the ruleset
    const ruleset = await createRuleset({
      game_id: game.id,
      rom_version: '1.14',
      provenance: {
        source: 'Tilt Forums Wiki',
        url: 'https://tiltforums.com',
        date_scraped: new Date().toISOString(),
        code_revision: '1.14',
        designers: {
          lead_designer: 'Steve Ritchie',
          code_rules: 'Tim Sexton',
          artwork: 'Josh Clay, Kevin O\'Connor',
          sound_design: 'Jerry Thompson',
          music: 'Scott Ian (Guitarist of Anthrax and Mr. Bungle)'
        },
        release_date: 'May 2019'
      },
    });

    console.log(`✅ Created ruleset: ${ruleset.id}`);

    // Rule sections data
    const ruleSections = [
      {
        title: 'Game Overview',
        section_type: 'overview',
        body: `Black Knight: Sword of Rage brings the legendary Black Knight back for revenge, and this time he's brought even more monsters along with him. Using the power of the almighty Sword of Rage, the player must slay these monsters before taking on the Black Knight himself in a climactic duel.

**Design Team:**
- Lead Designer: Steve Ritchie
- Code/Rules: Tim Sexton
- Artwork: Josh Clay, Kevin O'Connor
- Lead Sound Designer: Jerry Thompson
- Music: Scott Ian (Guitarist of Anthrax and Mr. Bungle)
- Release Date: May 2019

**Core Gameplay Loop:**
Shoot any of the three center shots enough times to light the ramp, then shoot the ramp to light mode start at the saucer behind the shield. During modes, shoot for the flashing arrows, or charge up the Sword of Rage by shooting targets before shooting the center target to use it.

**Key Features:**
- Five monster battles leading to Black Castle wizard mode
- Sword of Rage power-up system
- Triple Knights Challenge multiball
- Catapult Multiball (Premium/LE)
- KNIGHT letter collection for special multiballs
- Magna-Save feature above right outlane`,
        order_idx: 1,
        facts: {
          manufacturer: 'Stern Pinball',
          year: 2019,
          designer: 'Steve Ritchie',
          system: 'SPIKE 2',
          theme: 'Medieval fantasy',
          music: 'Scott Ian (Anthrax)',
          magna_save: 'right outlane magnet'
        }
      },
      {
        title: 'Skill Shots',
        section_type: 'skill_shot',
        body: `**Pro Model Skill Shots:**

**Standard Skill Shot:** Plunge the lit top lane for 750K + 250K for each additional skill shot. If the left flipper is held in and the ball enters the lit top lane WITHOUT changing it, a Super Skill Shot will be awarded instead, worth 3x the value of a normal skill shot.

**Super Skill Shot:** Hold in the left flipper and hit one of the three center shots (flail, center target, shield) for 1.5M + 500K for each additional Super Skill Shot.

**Premium/LE Model Skill Shots:**

**Standard Skill Shot:** Shoot the "light lock" target under the catapult lock for 1M + 250K for each additional skill shot.

**Super Skill Shot:** Lock a ball in the catapult on the upper playfield for 2M + 500K for each additional Super Skill Shot.

The skill shots provide significant early-game scoring and help establish momentum for the rest of the ball.`,
        order_idx: 2,
        facts: {
          pro_standard: '750K + 250K increments',
          pro_super: '1.5M + 500K increments',
          premium_standard: '1M + 250K increments',
          premium_super: '2M + 500K increments',
          center_shots: 'flail, center target, shield',
          flipper_technique: 'hold left flipper for super'
        }
      },
      {
        title: 'Monster Battles System',
        section_type: 'modes',
        body: `**Starting Battles:**
To qualify battles, shoot any of the three center shots to qualify the ramp. Then shoot the ramp to raise the Black Knight's shield, and start a battle by shooting behind it. For the first mode, only one shot has to be made to qualify the ramp. For the second mode, two shots, etc. These three shots are rainbow color-coded to tell you how many shots left you have.

**Battle Mechanics:**
- Mode timer starts at 65 seconds (displayed at top right)
- Time can be added by hitting Add Time standups on the left (~3 seconds per target hit, 10 seconds per completion)
- Base values increase by 200K for each completed mode and 950K once a lap is completed
- Values can be boosted by shooting the spinning flail when a mode is lit
- Modes in progress carry over from ball to ball
- Time is automatically added if timer is under threshold when ball drains

**Battle Progression:**
Successfully complete a battle to light extra ball at the saucer behind the shield. Win all five battles to qualify the final battle, Black Castle.

**Power Upgrades:**
Use the Sword of Rage during battles to enable 2x scoring and modify the battle to make it easier to complete.`,
        order_idx: 3,
        facts: {
          total_battles: 5,
          timer_start: '65 seconds',
          qualification_shots: 'progressive (1, 2, 3, etc.)',
          base_increase: '200K per mode, 950K per lap',
          add_time_bonus: '3 seconds per target, 10 per completion',
          wizard_mode: 'Black Castle',
          power_benefits: '2x scoring + easier completion'
        }
      },
      {
        title: 'Mud Bog Battle (Green)',
        section_type: 'mode',
        body: `**Objective:** Defeat the Hydra by cutting off its heads.

**Battle Mechanics:**
5 shots are lit (left spinner lane, left orbit, left ramp, "light lock" target, right orbit) to defeat the Hydra. Shooting any shot "locks" the shot in and starts a timer. Shoot the shot again to score more points, cut off one of the Hydra heads, and eliminate the shot from the mode.

**Progression:**
- KNIGHT letter awarded after cutting off the 2nd head
- Mode completed upon cutting off 4 heads
- Each shot must be hit twice: once to lock it, once to cut off the head

**Power Upgrade:**
When upgraded with Power, every shot can both seal and cut off a Hydra head in a single hit, making completion much faster.

**Strategy:**
Focus on shots you can consistently make, as the timer pressure increases once shots are locked in. The double-hit requirement makes this one of the more challenging battles without the Power upgrade.`,
        order_idx: 4,
        facts: {
          monster: 'Hydra',
          color: 'Green',
          shots_required: 5,
          knight_letter_progress: '2 heads cut',
          completion_requirement: '4 heads cut',
          power_benefit: 'single-hit head cutting',
          shot_list: 'left spinner, left orbit, left ramp, light lock, right orbit'
        }
      },
      {
        title: 'Molten Fire Battle (Orange)',
        section_type: 'mode',
        body: `**Objective:** Harm the Magma Beast by hitting all major shots.

**Battle Mechanics:**
All 7 major shots are lit to harm the Magma Beast. Once all shots have been made, they will relight for another round.

**Progression:**
- KNIGHT letter awarded after completing 3 shots
- Mode ends after completing all 8 shots total
- Shots relight after completing the first set of 7

**Power Upgrade:**
When upgraded with Power, all shots that haven't been completed become permanent, allowing you to loop one shot for a fast completion instead of hitting all 7 different shots.

**Strategy:**
This mode rewards flow and the ability to hit a variety of shots. The Power upgrade dramatically changes the strategy, allowing for single-shot looping rather than playfield coverage.`,
        order_idx: 5,
        facts: {
          monster: 'Magma Beast',
          color: 'Orange',
          shots_required: '7 major shots',
          knight_letter_progress: '3 shots',
          completion_requirement: '8 shots total',
          power_benefit: 'permanent shots enable looping',
          relight_mechanic: 'after completing all 7'
        }
      },
      {
        title: 'Burning Sands Battle (Yellow)',
        section_type: 'mode',
        body: `**Objective:** Defeat the Sandworm by hitting moving shot groups.

**Battle Mechanics:**
A set of three shots representing the Sandworm roves from left to right across the 7 major shots. Shoot one of the three shots to lock in the three-shot set for a few seconds, after which they will start moving again.

**Progression:**
- KNIGHT letter awarded at 3 successful shots to the Sandworm (or one complete set)
- Mode completed upon making 6 successful shots (or two complete sets)
- Shots move continuously unless locked by hitting one

**Power Upgrade:**
When upgraded with Power, the three center shots are automatically lit for damage, making it much easier to hit the moving targets.

**Strategy:**
Timing is crucial as the shots move continuously. Try to anticipate where the group will be and set up shots accordingly. The Power upgrade makes this significantly more manageable.`,
        order_idx: 6,
        facts: {
          monster: 'Sandworm',
          color: 'Yellow',
          shot_groups: '3 shots moving across 7 major shots',
          knight_letter_progress: '3 successful shots (1 set)',
          completion_requirement: '6 successful shots (2 sets)',
          power_benefit: 'center shots auto-lit',
          movement_pattern: 'left to right continuously'
        }
      },
      {
        title: 'Wicked Cavern Battle (Red)',
        section_type: 'mode',
        body: `**Objective:** Defeat the Hell Hand by alternating between left and right sides.

**Battle Mechanics:**
One shot starts randomly lit out of the 4 shots on the left side. Shooting this shot will randomly light one of the 4 shots on the right side. Repeat this alternating pattern four times, with an additional random shot in the group added per cycle.

**Progression:**
- KNIGHT letter awarded upon completing 3 shots
- Mode completed after 8 shots total
- Each cycle adds more shots to choose from
- Must alternate between left and right sides

**Power Upgrade:**
When upgraded with Power, all four shots on the current side are automatically lit, removing the randomness and making completion much more reliable.

**Strategy:**
This mode tests your ability to hit shots on both sides of the playfield. The increasing number of lit shots per cycle makes later cycles easier, but the alternating requirement maintains the challenge.`,
        order_idx: 7,
        facts: {
          monster: 'Hell Hand',
          color: 'Red',
          alternating_sides: 'left (4 shots) and right (4 shots)',
          knight_letter_progress: '3 shots',
          completion_requirement: '8 shots total',
          power_benefit: 'all 4 side shots lit',
          escalation: 'additional shots per cycle'
        }
      },
      {
        title: 'Deep Freeze Battle (Blue)',
        section_type: 'mode',
        body: `**Objective:** Defeat the Lich Lords by freezing and destroying them.

**Battle Mechanics:**
3 shots are lit in blue (left spinner lane, ramp, right orbit). Shooting a blue shot freezes a Lich and turns the shot red. Shooting a red shot awards more points and defeats the Lich at that shot and any other red shots that are lit. Once a Lich is defeated, another blue shot will be lit to qualify another Lich.

**Progression:**
- KNIGHT letter awarded after the 2nd defeated Lich
- Mode completed upon defeating 4 Lich Lords
- Two-step process: freeze (blue) then destroy (red)
- Red shots can defeat multiple Liches simultaneously

**Power Upgrade:**
When upgraded with Power, Liches can be killed in one shot, eliminating the freeze-then-destroy mechanic.

**Strategy:**
The two-step mechanic requires planning and shot control. Try to freeze multiple Liches before destroying them to maximize the multi-kill potential of red shots.`,
        order_idx: 8,
        facts: {
          monster: 'Lich Lords',
          color: 'Blue',
          freeze_shots: 'left spinner, ramp, right orbit',
          knight_letter_progress: '2 defeated Liches',
          completion_requirement: '4 Lich Lords defeated',
          power_benefit: 'one-shot kills',
          mechanic: 'freeze (blue) then destroy (red)'
        }
      },
      {
        title: 'Sword of Rage Power System',
        section_type: 'power_up',
        body: `**Charging the Sword:**
The sword meter on the right side of the display is filled via right drop target hits and miscellaneous switch hits. Individual targets give a small bump (1%), while drop target bank completions or shots to the center target give a decent bump (around 20%).

**Using Power:**
Once the sword is filled, the POWER insert will light at the center target. Collecting POWER when lit during a battle will enable:
- 2x Scoring for the entirety of the battle
- Modified battle mechanics to make completion easier
- Each battle has unique Power benefits (see individual battle descriptions)

**Sword Meter Progression:**
The meter starts off less and less full the more modes you play:
- First activation: 70% starting fill
- Second activation: 40% starting fill  
- All further activations: 0% starting fill

**Strategic Use:**
Power is most valuable on difficult battles or when going for completion rather than pure scoring. The 2x scoring applies to the entire battle duration, not just individual shots.`,
        order_idx: 9,
        facts: {
          meter_location: 'right side of display',
          individual_target: '1% fill',
          bank_completion: '20% fill',
          center_target: '20% fill',
          benefits: '2x scoring + easier mechanics',
          starting_fills: '70%, 40%, 0%',
          activation_location: 'center target when POWER lit'
        }
      },
      {
        title: 'Triple Knights Challenge Multiball',
        section_type: 'multiball',
        body: `**Starting the Mode:**
Shoot the "light lock" target to light lock at the saucer behind the Black Knight's shield. Lock a ball to re-light the target. Three virtual locks start this 3-ball multiball. Subsequent multiballs require multiple standup hits to light each lock.

**Phase 1:**
Triple Knights Challenge begins with the left spinner lane, ramp, and shield saucer lit to score jackpots and defeat the skeletal knights. After completing these 3 shots, the ramp will be lit for a hurry-up that starts Phase 2.

**Hurry-Up Mechanic:**
The Knight's flail will be spinning rapidly and can be stopped temporarily by making partial progress on the ramp or hitting the flail ball. Shooting this shot awards the hurry-up value (starts at 2M, increasing by 1M for subsequent playthroughs) and sets the jackpot value for the next phase.

**Phase 2:**
Upon scoring the hurry-up, all shots light for jackpots based on the hurry-up value. Complete all shots to light the ramp for a Super Jackpot worth 3x the jackpot value plus a KNIGHT letter. After the super jackpot, the mode returns to Phase 1 with boosted scoring.

**Add-a-Ball:**
Collecting enough spins at the left spinner will light Add-a-Ball on the left spinner lane (Premium/LE: drop target serves this function).`,
        order_idx: 10,
        facts: {
          ball_count: '3-ball multiball',
          lock_location: 'saucer behind shield',
          phase_1_shots: 'left spinner, ramp, shield saucer',
          hurry_up_start: '2M (increases 1M per playthrough)',
          super_jackpot: '3x jackpot value + KNIGHT letter',
          add_ball_requirement: 'spinner spins (Pro) or drop target (Prem/LE)',
          progression: 'phases repeat with boosted scoring'
        }
      },
      {
        title: 'Catapult Multiball (Premium/LE)',
        section_type: 'multiball',
        body: `**Starting the Mode:**
Lock 3 balls in the Catapult in the upper playfield to start Catapult Multiball. All 3 locks are lit (pulsing) for the first Catapult Multiball, but future locks must be lit by hitting the standup next to the Catapult.

**Jackpot System:**
All major shots on the lower playfield are lit for 250K (+25K for most jackpots). The Catapult in the upper playfield will collect a super jackpot worth:
- Base value: 300K (+amount per super)
- Plus total of jackpots since the last super jackpot
- Multiplier system: standup lights ball-lock lights to represent +1x multiplier for next super jackpot (up to 4x total)
- Multiplier resets when collected

**Add-a-Ball:**
Hitting the left drop target will light Add-a-Ball, which is collected at the same location.

**Premium/LE Exclusive:**
This multiball is only available on Premium and Limited Edition machines, taking advantage of the upper playfield catapult mechanism.

**Strategy:**
Build up jackpots on the lower playfield before collecting the super jackpot. Use the multiplier system to maximize super jackpot values.`,
        order_idx: 11,
        facts: {
          availability: 'Premium/LE only',
          lock_location: 'upper playfield catapult',
          initial_locks: '3 lit for first multiball',
          jackpot_value: '250K + 25K increments',
          super_base: '300K + jackpot total',
          max_multiplier: '4x',
          add_ball_location: 'left drop target',
          upper_playfield: 'catapult mechanism required'
        }
      },
      {
        title: 'KNIGHT Letter Collection & Multiballs',
        section_type: 'collection',
        body: `**Collecting KNIGHT Letters:**
- Making enough shots during battles
- Completing WAR Hurry-Ups
- Collecting super jackpot during Triple Knights Challenge
- By default, "K" and "N" are lit at start of game
- First completion requires 4 letters, subsequent completions require 6 letters

**KNIGHT Multiball:**
Done in the style of the multiball from the original Black Knight, with a rendition of the famous main play theme from Black Knight sequel. During this multiball:
- Playfield values multiplied by number of active balls (up to 3x)
- No progression can be made towards other features except Super Modes
- Super Modes cannot be boosted further once multiball starts
- Can be started at any time in single-ball play
- If started during timed mode, ends both modes without compensation

**The King's Ransom:**
Completing KNIGHT for the second time in a game begins The King's Ransom, complete with display effects from Black Knight 2000:
- Minute-long 3-ball multiball with unlimited ball saver
- +5x bonus multiplier added at start
- Extra ball lit at saucer behind shield
- Jackpots collected by shooting flail, either orbit, or completing WAR lanes
- After timer expires, returns to normal play

**Starting Method:**
Complete KNIGHT letters, then shoot the left spinner lane to choose between the two modes.`,
        order_idx: 12,
        facts: {
          starting_letters: 'K and N lit',
          first_completion: '4 letters needed',
          subsequent_completions: '6 letters needed',
          knight_mb_multiplier: 'up to 3x playfield',
          kings_ransom_duration: '60 seconds',
          kings_ransom_ball_save: 'unlimited',
          kings_ransom_bonus: '+5x multiplier',
          activation_shot: 'left spinner lane'
        }
      },
      {
        title: 'Super Modes & Super Jackpot',
        section_type: 'bonus_feature',
        body: `**Starting Super Modes:**
A random, untimed Super Mode can be started at the center target when "SUPER" is lit, achieved via enough right spinner spins. Available Super Modes include:
- Lanes
- Slings  
- Spinner
- Orbits
- Targets
- Pops

**Super Mode Mechanics:**
- Super Modes remain active until the ball drains
- Shoot the left lane to boost values of all active Super Modes (unless KNIGHT Multiball is running)
- Values are locked during KNIGHT Multiball
- A Super Mode is maxed when its icon and playfield insert turn purple
- Multiple Super Modes can be active simultaneously

**Super Jackpot:**
The values from all active Super Modes can be cashed out as a "Super Jackpot" by successfully using the Magna-Save to save a ball. This will:
- End all active Super Modes
- Award the combined value of all active modes
- Can be multiplied by playfield multipliers during KNIGHT Multiball

**Strategy:**
Accumulate multiple Super Modes and boost their values before using the Magna-Save to cash out for maximum Super Jackpot value.`,
        order_idx: 13,
        facts: {
          super_mode_types: 6,
          activation: 'center target when SUPER lit',
          requirement: 'right spinner spins',
          duration: 'until ball drains',
          boost_shot: 'left lane',
          max_indicator: 'purple icon and insert',
          cashout_method: 'Magna-Save usage',
          knight_mb_interaction: 'values locked during multiball'
        }
      },
      {
        title: 'WAR Hurry-Up',
        section_type: 'hurry_up',
        body: `**Starting WAR Hurry-Up:**
Complete the top lanes (W-A-R) to increase the bonus multiplier and light all three center shots for a hurry-up.

**Hurry-Up Mechanics:**
Each of the three center shots has a base value starting at 3M, increasing with pop bumper hits, and maxing out at 25M:
- **Flail:** Must be hit in order to shoot the ramp
- **Ramp:** Available after hitting flail
- **Shield:** Must be hit once to collect its hurry-up (Mystery takes priority if lit)

**Completion:**
Collecting all three awards will light the center target to complete the round and score a KNIGHT letter. More lane completions will be required to begin the hurry-up on subsequent attempts.

**Strategic Value:**
WAR Hurry-Ups provide substantial scoring opportunities and are a reliable source of KNIGHT letters. The escalating base values make pop bumper hits valuable during these modes.

**Pop Bumper Strategy:**
Since pop bumper hits increase the hurry-up values, try to get the ball into the pop bumpers before starting the hurry-up sequence for maximum scoring potential.`,
        order_idx: 14,
        facts: {
          activation: 'complete W-A-R top lanes',
          base_value: '3M starting',
          max_value: '25M',
          value_increase: 'pop bumper hits',
          shot_sequence: 'flail enables ramp',
          completion_award: 'KNIGHT letter',
          escalation: 'more lanes needed for subsequent attempts'
        }
      },
      {
        title: 'Ball Save & Magna-Save',
        section_type: 'save_features',
        body: `**Ball Save:**
Ball save can be lit at the left outlane by completing the two "add time" standup targets to the left of the game enough times. The amount of target completions required to qualify the ball save increases each time it has been used. Only one target completion is required to light the first ball save.

**Magna-Save:**
As with the previous two Black Knight machines, the game features a magnet above the right outlane that can be used to save balls:
- Press the action button when the ball is about to drain down the right outlane
- After the Magna-Save is used, complete the drop targets to relight it
- Using the Magna-Save also scores the Super Jackpot (combined value of all active Super Modes)
- This provides a strategic element beyond just saving the ball

**Add Time Targets:**
The "add time" standup targets serve dual purposes:
- Add time during battle modes (~3 seconds per target, 10 seconds per completion)
- Progress toward lighting ball save at left outlane

**Strategic Use:**
The Magna-Save becomes especially valuable when multiple Super Modes are active, as it provides both ball saving and significant scoring through the Super Jackpot feature.`,
        order_idx: 15,
        facts: {
          ball_save_location: 'left outlane',
          ball_save_requirement: 'add time target completions',
          first_ball_save: '1 completion required',
          magna_save_location: 'right outlane magnet',
          magna_save_relight: 'complete drop targets',
          magna_save_bonus: 'Super Jackpot awarded',
          add_time_value: '3 seconds per target, 10 per completion'
        }
      },
      {
        title: 'Mystery & Other Features',
        section_type: 'bonus_feature',
        body: `**Mystery Awards:**
Complete RAGE at the inlanes and outlanes (which cycle with the flippers) to light the saucer behind the shield for Mystery. Mystery can award:
- 2M / 3M / 4M / 5M points
- Hold Bonus
- Light Lock (advance lock progression by 1 target hit)
- Spot WAR Lanes
- Add Bonus X (+1x)
- Add KNIGHT Letter
- Light Super
- Advance Save (by 1 target set)
- Light Magna-Save
- Light Extra Ball (percentage-based)

**U-Turns:**
Once either the left or right orbit has been shot, the light in front of the orbit will turn red to indicate it will begin the U-Turn sequence and send the ball past the top lanes. Make U-Turns without making any other shots to score additional points. An adjustable number of U-Turns will light extra ball at the saucer behind the shield.

**Extra Ball Opportunities:**
- Winning a battle
- Collecting enough U-Turns
- Starting The King's Ransom
- Percentage-based mystery award

**Last Chance (Premium/LE Exclusive):**
Additional ball-saving feature available on Premium and Limited Edition models.`,
        order_idx: 16,
        facts: {
          rage_letters: 'inlanes and outlanes (cycle with flippers)',
          mystery_awards: 10,
          mystery_location: 'saucer behind shield',
          u_turn_indicator: 'red light in front of orbit',
          u_turn_requirement: 'no other shots between orbits',
          extra_ball_sources: 4,
          last_chance: 'Premium/LE only'
        }
      },
      {
        title: 'Black Castle Wizard Mode',
        section_type: 'wizard_mode',
        body: `**Qualification:**
Once all five battles have been won, the sixth battle, Black Castle, will be qualified and can be started in the same way as the other battles.

**Mode Structure:**
Unlike other battles, Black Castle is mutually exclusive and is a 200-second timed mode. You've finally made it to the Black Knight's keep and it's time to defeat him once and for all by completing four outer loop shots.

**Battle Mechanics:**
The mode starts with the three center shots lit. Hitting all three of these shots will light the four outer loop shots. When one of the outer loops is made:
- The three inner shots will relight
- The flail will be spinning faster
- The shield will kick back the ball far more violently
- Ball saver is provided every time an outer shot is hit

**Completion:**
Once all four outer shots have been completed, the saucer behind the shield will light to finish off the Black Knight, scoring a bonus based on the time remaining in the mode.

**Rage Multiball:**
Completing Black Castle begins Rage Multiball, a 6-ball multiball where:
- Center target is always lit for a frenzy bonus
- Starting at 1M per hit
- Incrementing linearly by amount related to time remaining when Black Castle was completed

**Mode Cycling:**
This mode will ALWAYS be the last battle played in a cycle. After this battle, regardless of success or failure, you can choose from the other five battles once more.`,
        order_idx: 17,
        facts: {
          qualification: 'complete all 5 battles',
          duration: '200 seconds',
          exclusivity: 'mutually exclusive mode',
          center_shots: '3 shots to light outer loops',
          outer_loops: '4 shots required',
          difficulty_increase: 'faster flail, violent shield kicks',
          ball_save: 'provided after each outer shot',
          rage_multiball: '6-ball multiball',
          frenzy_base: '1M per center target hit',
          cycle_position: 'always last battle in cycle'
        }
      },
      {
        title: 'End-of-Ball Bonus',
        section_type: 'bonus',
        body: `**Bonus Calculation:**
Bonus is determined by:
- **Base bonus** (switch hits throughout the ball)
- **Super Modes started** (+25K per mode activated)
- **U-Turns collected** (value based on number completed)
- **All multiplied by bonus multiplier**

**Bonus Multiplier:**
The bonus multiplier increases with each completion of the WAR lanes (W-A-R top lanes). This provides an incentive to complete the top lanes beyond just starting WAR Hurry-Ups.

**Strategic Considerations:**
- Switch hits provide the base bonus foundation
- Starting multiple Super Modes significantly boosts bonus
- U-Turn collections add substantial value
- WAR lane completions are crucial for multiplier building
- The bonus system rewards active, varied gameplay

**Hold Bonus:**
The "Hold Bonus" mystery award prevents the bonus from resetting between balls, making it valuable for building large end-of-game bonuses across multiple balls.`,
        order_idx: 18,
        facts: {
          base_bonus: 'switch hits',
          super_mode_bonus: '25K per mode started',
          u_turn_bonus: 'based on collections',
          multiplier_source: 'WAR lane completions',
          hold_bonus: 'mystery award prevents reset',
          calculation: 'base + modes + u-turns × multiplier'
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

    console.log('🎉 Black Knight seeding completed successfully!');
    console.log(`📊 Added ${ruleSections.length} rule sections`);
    console.log('💡 Run "npm run reindex" to update Meilisearch with the new game');

  } catch (error) {
    console.error('❌ Error seeding Black Knight:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedBlackKnight().catch((err) => {
  console.error('❌ Black Knight seeding failed:', err);
  process.exit(1);
});
