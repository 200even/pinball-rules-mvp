import { getPool, query, createGame, createRuleset, createRuleSection, updateRuleSectionEmbedding } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

async function seedMetallica() {
  console.log('🤘 Seeding Metallica Remastered...');

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.length < 40) {
    console.warn('⚠️  OpenAI API key is not configured. Embeddings will be skipped.');
  }

  const client = getPool();

  try {
    // Insert the game
    const game = await createGame({
      title: 'Metallica Remastered',
      manufacturer: 'Stern Pinball',
      year: 2024,
      system: 'SPIKE 2',
      ipdb_id: null, // Remastered version
      pinside_id: null, // TBD - need to look up
    });

    console.log(`✅ Created game: ${game.id}`);

    // Insert the ruleset
    const ruleset = await createRuleset({
      game_id: game.id,
      rom_version: '1.01',
      provenance: {
        source: 'Tilt Forums Wiki',
        url: 'https://tiltforums.com',
        date_scraped: new Date().toISOString(),
        code_revision: '1.01',
        designers: {
          lead_designer: 'John Borg',
          original_code: 'Lyman F. Sheats Jr. (RIP), Lonnie D. Ropp, Mike Kyzivat',
          expanded_code: 'Raymond Davidson',
          sound: 'Jerry Thompson'
        },
        release_date: 'November 2024',
        notes: 'LCD-era remastered version with new modes and quality-of-life fixes',
        original_release: '2013'
      },
    });

    console.log(`✅ Created ruleset: ${ruleset.id}`);

    // Rule sections data
    const ruleSections = [
      {
        title: 'Game Overview',
        section_type: 'overview',
        body: `Metallica was one of the first Stern releases to revitalize interest in physical pinball back in 2013 and received continuous improvement from code champion Lyman Sheats in the following years. The game is highly regarded for "Crank It Up" and the risk/reward decision making involved that shaped many more recent releases, the wide variety of multiball and mode stacking opportunities, and of course, the music & callouts courtesy of the band themselves.

The game was given a re-release as an LCD-era machine in late 2024 and obtained some quality-of-life fixes along with a few new modes and rules.

**Design Team:**
- Lead Designer: John Borg
- Original Code/Rules: Lyman F. Sheats Jr. (RIP), Lonnie D. Ropp, Mike Kyzivat
- Expanded Code: Raymond Davidson
- Sound: Jerry Thompson
- Release Date: November 2024 (Remastered), Original: 2013

**Core Gameplay:**
- Shoot main features (Grave Markers, Electric Chair, Coffin Captive Ball, Snake) to begin multiball modes and progress towards Crank It Up
- During Crank It Up, build jackpot values and decide whether to cash out or continue
- Play all 4 Crank It Up modes to qualify End of the Line wizard mode
- Play all four multiballs to qualify Blackened mini-wizard mode
- Multiple side modes can stack with any active feature

**Song Choice:**
At the start of each ball, players can choose one of 22 Metallica songs as background music. This choice has no effect on gameplay, but starting features/modes will change to their associated songs.`,
        order_idx: 1,
        facts: {
          designer: 'John Borg',
          manufacturer: 'Stern Pinball',
          year: 2024,
          original_year: 2013,
          system: 'SPIKE 2',
          theme: 'Metallica / Heavy Metal',
          song_count: 22,
          main_features: 4,
          crank_it_up_modes: 4,
          multiball_modes: 6
        }
      },
      {
        title: 'Skill Shots',
        section_type: 'skill_shot',
        body: `**Standard Skill Shot:**
Plunge for the flashing rollover to score a skill shot value of 200K. The skill shot value increases by 50K for each skill shot made, and plunging for the right rollover awards 2x the skill shot value.

**Super Skill Shot:**
Holding the left flipper disables the orbit up-post and activates the super skill shot, which can be collected by shooting any major shot (including the scoop, captive ball, Snake, and Sparky). This typically awards 2x the value of the standard skill shot and increases their value by 100K.

**Super Skill Shot Bonus Awards:**
- **Dead End Target:** Immediately qualifies 2x Playfield
- **Scoop:** Awards Mystery
- **Blue Spider Arrow:** Qualifies that shot for a Coffin Hurry-Up and adds 200K to the next skill shot. On Ball 1, the lit shot will be random (default settings) or left orbit (Competition mode). On subsequent balls, the lit spider arrow carries over from the previous ball
- **Rollover Lanes:** 2x the value of a standard skill shot (4x if you plunge to the right lane!)

**Strategic Value:**
The super skill shot provides immediate benefits beyond just points, with the Blue Spider Arrow being particularly valuable for setting up Coffin Hurry-Ups early in the ball.`,
        order_idx: 2,
        facts: {
          standard_value: '200K + 50K increments',
          super_multiplier: '2x standard + 100K increment',
          super_technique: 'hold left flipper to disable up-post',
          blue_spider_bonus: '200K + Coffin Hurry-Up qualification',
          rollover_max: '4x value (right rollover)',
          dead_end_bonus: 'immediate 2x Playfield',
          scoop_bonus: 'Mystery award'
        }
      },
      {
        title: 'Multiballs & Band Members System',
        section_type: 'multiballs',
        body: `Multiball modes are a quick way to rack up points and collect items on Metallica. There are six different multiball modes, four of which are mutually exclusive, and one exclusive to machines with the topper installed.

**Universal Multiball Features:**
During any multiball mode, completing the four pick targets lights the Snake for a timed lock + 2x playfield for 20 seconds. Scoring the timed lock also adds a ball into play the first time it has been scored during any multiball, and activates a ball saver for about 10 seconds. Playfield scoring resets to 1x once the timer expires.

All side modes can be started or brought into multiball modes and are vital to high scoring.

**Band Member Progression:**
Starting or scoring super jackpots during multiball modes qualifies band members or advances their level:
- **James Hetfield** - Electric Chair Multiball
- **Robert Trujillo** - Grave Marker Multiball  
- **Kirk Hammett** - Snake Multiball
- **Lars Ulrich** - Coffin Multiball

**Band Member Levels:**
- Maximum level for each member is 8
- Levels carry over across the entire game
- Total of all band members' levels determines scoring during Blackened mini-wizard mode
- Getting each member to level 8 awards a letter in UNFORGIVEN to qualify the super wizard mode

**The Six Multiball Modes:**
1. **Electric Chair Multiball** (James) - Mutually exclusive
2. **Grave Marker Multiball** (Robert) - Mutually exclusive
3. **Snake Multiball** (Kirk) - Mutually exclusive
4. **Coffin Multiball** (Lars) - Mutually exclusive, can bring in one additional multiball
5. **Frantic Multiball** - Mutually exclusive, requires 10 setlist combo pairs
6. **And Justice for All Multiball** - Topper exclusive, requires spelling METALLICA on topper

**Strategy:**
Focus on advancing band members to higher levels for better Blackened scoring and UNFORGIVEN qualification.`,
        order_idx: 3,
        facts: {
          total_multiballs: 6,
          mutually_exclusive: 4,
          topper_exclusive: 1,
          band_members: 4,
          max_member_level: 8,
          snake_add_ball: 'timed lock + 2x playfield 20s',
          ball_save_duration: '10 seconds',
          blackened_qualification: 'play all 4 main multiballs',
          unforgiven_requirement: 'all members level 8'
        }
      },
      {
        title: 'Electric Chair Multiball (James)',
        section_type: 'multiball',
        body: `**Song:** Creeping Death (odd-numbered multiballs), Ride the Lightning (even-numbered multiballs)

**Starting Multiball:**
Shoot Sparky 10 times to light electric chair inserts at the major shots and start Electric Chair Multiball. Shots to either side of Sparky score 1 hit, while shots to the target in between them score 2 hits instead. When one shot is remaining, Sparky will taunt you and all three inserts will strobe. Shoot Sparky once more to start multiball.

Subsequent Electric Chair Multiball attempts require three more Sparky hits than the last.

**During Multiball:**
Fill the Jacob's Ladder by hitting lit jackpot shots. The jackpot shots are the flashing electric chair inserts on the left and right orbits, and the Sparky shot. The base jackpot value starts at 250K + (2.5K × total items).

Once the power meter is completely full by scoring jackpots (each one counts as 10 switch hits) or collecting enough switch hits through other means, shoot Sparky for a super jackpot worth 1.5M + (5K × total items).

**Sparky Character Progression:**
Each Super Jackpot collected electrocutes one of seven Sparky characters indicated by the colored electric chair inserts (white for the first one all the way up to red for the final one). As soon as the seventh Sparky has been electrocuted, the orbits, ramps, and Sparky are all lit for super jackpots for this and every subsequent Electric Chair Multiball during the game.

**Level Up James:**
- Starting this multiball
- Scoring super jackpots during the multiball

**Strategy:**
Focus on completing the Jacob's Ladder quickly to access super jackpots. The permanent super jackpot lighting after electrocuting all seven Sparkys makes subsequent Electric Chair Multiballs much more lucrative.`,
        order_idx: 4,
        facts: {
          band_member: 'James Hetfield',
          songs: 'Creeping Death (odd), Ride the Lightning (even)',
          starting_requirement: '10 Sparky hits',
          escalation: '+3 hits per subsequent multiball',
          base_jackpot: '250K + 2.5K × items',
          super_jackpot: '1.5M + 5K × items',
          sparky_characters: 7,
          permanent_upgrade: 'after 7th Sparky electrocuted',
          jacobs_ladder: 'power meter filled by jackpots'
        }
      },
      {
        title: 'Grave Marker Multiball (Robert)',
        section_type: 'multiball',
        body: `**Song:** Master of Puppets

**Starting Multiball:**
Each shot to the inline drop targets increases your bonus multiplier, advances towards lighting resurrection ball save, and lights a grave marker insert at a random shot. Once all 3 drop targets have been knocked down, shoot the grave marker target behind them to start multiball.

If any drop targets were hit during a different multiball, when you are back to single ball play, the drop targets will reset when it is safe to do so if the number of drop targets physically down exceeds the number you've hit during single ball play.

Subsequent Grave Marker Multiball attempts require one more grave marker target hit than the last.

**During Multiball:**
All four ramps and orbits major shots are lit for jackpots that start at 200K + (2.5K × total items). Shooting the grave marker target itself scores a larger jackpot worth 250K at base value, and relights all shots for jackpots.

**Double and Super Jackpots:**
Once you have scored four jackpots at any shot, the grave marker target will strobe for double jackpot. Scoring the double jackpot will cause the magnet to hold the ball for 20 seconds. The ball can then be knocked off the magnet to score the super jackpot (1.25M + 2.5K × total items).

While the ball is being held, hitting three unique jackpot shots will increase the super jackpot multiplier by +1x to a maximum of 5x. The super jackpot multiplier is maintained for the rest of the game, but will only increase when the super jackpot isn't scored.

After the super jackpot has been collected, the number of jackpots required to qualify subsequent double jackpots increases by 1 for the rest of the current multiball.

**Level Up Robert:**
- Starting this multiball
- Scoring double jackpots at the magnet
- Scoring super jackpots during the multiball
- Multiplied super jackpots add +1 level per multiplier

**Strategy:**
The magnet hold mechanic is crucial - use the 20-second window to hit three unique jackpot shots for maximum super jackpot multiplier. The permanent multiplier increase makes this multiball valuable for long-term scoring.`,
        order_idx: 5,
        facts: {
          band_member: 'Robert Trujillo',
          song: 'Master of Puppets',
          starting_requirement: '3 drop targets + grave marker',
          escalation: '+1 grave marker hit per subsequent multiball',
          base_jackpot: '200K + 2.5K × items',
          grave_marker_jackpot: '250K + relights all shots',
          super_jackpot: '1.25M + 2.5K × items',
          magnet_hold: '20 seconds',
          max_multiplier: '5x (permanent)',
          multiplier_requirement: '3 unique jackpot shots during hold'
        }
      },
      {
        title: 'Snake Multiball (Kirk)',
        section_type: 'multiball',
        body: `**Song:** Sad But True

**Starting Multiball:**
Shoot the Snake when lit to spot letters in SNAKE. The Snake unlights once a letter has been collected, and can be relit by either hitting the snake's mouth or shooting any shot with a lit Snake insert - three of these inserts light each time you shoot the Snake. Once SNAKE has been completed, the next shot to the Snake will start 2-ball multiball.

For subsequent Snake Multiball attempts, the snake mouth can only be opened by hitting it directly rather than making a lit Snake insert shot.

**During Multiball:**
Jackpots are lit at all major shots and the Snake itself, worth 300K + (3K × total items). Hitting any shot other than the snake adds a +1x multiplier to the "Snake Combo", which is collected at the Snake and scores the current jackpot value times the multiplier. The Snake Combo value maxes at 3x.

**Super Jackpots:**
Collect 5 Snake Combo jackpots to light all shots for super jackpots, valued at 750K + (2.5K × total items).

**Level Up Kirk:**
- Starting this multiball
- Scoring super jackpots during the multiball

**Strategy:**
The Snake Combo system rewards shot variety before returning to the Snake. Build up to 3x multiplier by hitting different shots, then collect at the Snake. Focus on completing 5 Snake Combo jackpots to access the lucrative super jackpots.

**Difficulty Progression:**
The requirement to hit the snake mouth directly on subsequent attempts makes this multiball progressively more challenging, requiring precise aim and timing.`,
        order_idx: 6,
        facts: {
          band_member: 'Kirk Hammett',
          song: 'Sad But True',
          starting_requirement: 'spell SNAKE',
          ball_count: '2-ball multiball',
          base_jackpot: '300K + 3K × items',
          snake_combo_max: '3x multiplier',
          super_jackpot: '750K + 2.5K × items',
          super_requirement: '5 Snake Combo jackpots',
          escalation: 'snake mouth direct hits only',
          snake_inserts: '3 light per Snake shot'
        }
      },
      {
        title: 'Coffin Multiball (Lars)',
        section_type: 'multiball',
        body: `**Song:** For Whom the Bell Tolls

**Starting Multiball:**
Every shot to the captive ball collects coffins and counts down towards locking a ball at the Coffin magnet:
- **First lock:** 5 captive ball hits required
- **Second lock:** 10 hits required  
- **Third lock:** 15 hits required

**Increasing Coffin Hits:**
The number of coffin hits for each captive ball shot can be increased:
- **Return lanes:** Light the captive ball for 2 coffin hits
- **Combos:** Making combos before completing them at the captive ball awards 1 coffin hit for each shot made in the combo

As soon as the third ball is locked, Coffin Multiball begins.

**During Multiball:**
Coffin multiball is unique among the multiball modes in Metallica because it allows players to bring in one additional multiball mode while it is running.

Jackpots are available by alternating between the captive ball and the flashing shots for 400K + (4K × total items). Once all of the flashing shots have been made one time each, the next flashing captive ball shot will score a super jackpot worth 3M + (10K × total items) in place of the normal jackpot value.

**Level Up Lars:**
- Starting this multiball
- Scoring captive ball jackpots during the multiball

**Strategy:**
This is the most flexible multiball since it can stack with one other multiball. Use return lanes and combos to accelerate the lock process. The alternating shot pattern requires good ball control and planning.

**Multiball Stacking:**
The ability to bring in another multiball makes this extremely valuable for high scoring - plan which multiball to stack based on your current band member levels and scoring goals.`,
        order_idx: 7,
        facts: {
          band_member: 'Lars Ulrich',
          song: 'For Whom the Bell Tolls',
          lock_requirements: '5, 10, 15 captive ball hits',
          return_lane_bonus: '2 coffin hits',
          combo_bonus: '1 hit per combo shot',
          base_jackpot: '400K + 4K × items',
          super_jackpot: '3M + 10K × items',
          unique_feature: 'can stack with one other multiball',
          alternating_pattern: 'captive ball ↔ flashing shots'
        }
      },
      {
        title: 'Frantic & And Justice for All Multiballs',
        section_type: 'multiball',
        body: `**Frantic Multiball:**
**Song:** Frantic

**Starting Multiball:**
Frantic Multiball is lit at the piston target after collecting 10 pairs of setlist combos, by collecting the combos during the modes that they correspond to. This multiball is mutually exclusive and cannot be started during any other multiball.

**During Multiball:**
Frantic is a 4-ball multiball where all five major shots are constantly changing color between five different colors as they are hit (white → yellow → blue → green → pink → back to yellow). If two or more shots are lit in the same color, they will score jackpots worth 10x the current shot value and increase the base shot value with each jackpot made.

If at least three shots are the same color, then the piston target will light to score a super jackpot worth the total of all jackpots prior (excluding the 2x playfield multiplier) and adding a ball into play, to a maximum of 3 times. The super jackpot is multiplied by the number of shots with a matching color minus 2.

**And Justice for All Multiball (Topper Exclusive):**
**Song:** …And Justice for All

**Starting Multiball:**
This multiball can only be started if the topper is installed. During the Lady Justice side mode, hitting the flashing shots will spell out METALLICA using the topper lights if the player isn't currently in a Crank it Up mode or other multiball mode that isn't coffin multiball.

For the first Lady Justice mode, fast flashing shots will add 2 letters and other lit shots will add 1 letter. The difficulty of spelling METALLICA on the topper increases each time the multiball is started.

**During Multiball:**
The left and right shots alternate for jackpots and double jackpots respectively, with each single jackpot adding 1 letter to METALLICA and each double jackpot adding 2. Once three jackpots have been scored, the next shot to either ramp will score a super jackpot and add a ball to the multiball (one time per multiball only).

The super jackpot multiplier increases by +1x every time METALLICA is spelled during the multiball. However, as soon as a super jackpot is scored, the multiplier and the super jackpot value will reset.

**Strategy:**
Frantic requires careful color management - try to get multiple shots the same color for jackpots, then aim for three matching colors for super jackpots. And Justice for All rewards consistent ramp shooting and METALLICA spelling.`,
        order_idx: 8,
        facts: {
          frantic_requirement: '10 setlist combo pairs',
          frantic_ball_count: '4-ball multiball',
          frantic_colors: 5,
          frantic_jackpot: '10x current shot value',
          frantic_super_requirement: '3+ matching color shots',
          frantic_max_balls: '3 add-a-balls possible',
          justice_requirement: 'topper + spell METALLICA',
          justice_letters: '1 per jackpot, 2 per double jackpot',
          justice_super_requirement: '3 jackpots',
          justice_multiplier: '+1x per METALLICA spelling'
        }
      },
      {
        title: 'Crank It Up System',
        section_type: 'modes',
        body: `These are the game's main single-ball modes, which have the potential for huge scores if players are willing to put up with the risk of keeping the ball alive. Crank It Up lights at the scoop after collecting 12 of each item +1 per Crank It Up played during the same game.

**Collecting Items:**
To light the scoop for Crank It Up, 12 (+1 per subsequent mode) of the four items must be collected:
- **Electric Chairs**
- **Grave Markers**  
- **Snakes**
- **Coffins**

**Three Ways to Collect Items:**
1. **Direct shots** to their corresponding feature on the playfield
2. **Shooting the corresponding insert** at any of the five major shots
3. **Using a self-destruct button** which collects one item per lit insert and 1 coffin for each full column of 3 inserts

**Item Insert System:**
The inserts light by shooting their respective features, and the blue spider arrow determines which shot the insert will be placed on. If all three inserts are on a single shot, the next shot made there will start a Coffin Hurry-Up.

**Coffin Collection:**
Coffins can only be collected by making direct shots to the captive ball, or by using the self-destruct button with a full column of items lit. The left inlanes light the captive ball for 2 hits for a limited time. You can also score more captive ball hits per shot by shooting combos.

**Starting Crank It Up:**
Crank It Up lights at the scoop as soon as the required items have been collected and the player has returned to single-ball play, indicated by a unique sound/display and the 4 item inserts above the flippers pulsing.

Shoot the scoop, and then choose from any of the four Crank It Up modes (that haven't been played yet) using the flipper buttons - or a relatively low amount of points (5M + 1M per subsequent mode) instead of starting it.

**Mode Characteristics:**
- Long modes (averaging around 6 minutes each!)
- Ball save only active for the first few seconds
- Goal is to score points by shooting flashing shots, then cash out at the scoop
- Making direct shots to all four main features lights the scoop to either collect the jackpot (L flipper) or continue the mode (R flipper)
- "Completion bonus" scored after making enough shots, adds letter to UNFORGIVEN and enables victory laps`,
        order_idx: 9,
        facts: {
          item_requirement: '12 each (+1 per subsequent mode)',
          item_types: 4,
          collection_methods: 3,
          mode_count: 4,
          average_duration: '6 minutes',
          ball_save: 'first few seconds only',
          cash_out_choice: 'L flipper collect, R flipper continue',
          completion_bonus: 'UNFORGIVEN letter + victory laps',
          buyout_cost: '5M + 1M per subsequent mode'
        }
      },
      {
        title: 'Crank It Up Modes',
        section_type: 'mode',
        body: `**For Whom the Bell Tolls:**
The five major shots' item inserts are lit for jackpots. Make three shots to all five to score increasing jackpot values and light their inserts. Completing "columns" or "rows" of inserts scores even higher jackpot values. Lighting all 15 inserts scores the Completion Bonus.
- **Crank It Up Bonus:** Makes the next shot collect all inserts at its lane

**Fade to Black:**
Switch hits add to the jackpot value, which is collected at a random flashing shot or by collecting 20 switch hits. Solidly lit shots score a portion of the jackpot value. Fill the vertical progress bar on the screen through any combination of jackpots and switch hits to score the Completion Bonus.
- **Crank It Up Bonus:** Reduces the switch hits required for the next jackpots by 2 to a maximum of 5

**Battery:**
Shoot Sparky over and over to score increasing amounts of points and light the electric chair inserts at other shots for jackpots. Hitting the ramps & orbits increases the value of the next Sparky hit, with one random flashing shot that resets when Sparky is hit increasing the value by 2x. Make 12 shots to Sparky to score the Completion Bonus.
- **Crank It Up Bonus:** Lights all five shots for 2x advances

**Enter Sandman:**
Three randomly selected inserts on each of the five major shots will be flashing, which alternate shots with every switch hit. Making any shot with a solidly lit insert scores a jackpot, which can be doubled or tripled if more than one lit insert is on that shot. Light all 15 of the inserts solid to score the Completion Bonus.
- **Crank It Up Bonus:** Adds one insert

**Universal Features:**
- All side modes can be brought into Crank It Up modes
- Mystery during Crank It Up always awards "Crank It Up Bonus"
- After cashing out, can re-collect 25% of jackpot value by making all five spider arrow shots + scoop
- Scoring completion bonus adds UNFORGIVEN letter and enables victory laps

**Strategy:**
Each mode has a different risk/reward profile. For Whom the Bell Tolls and Enter Sandman reward systematic shot-making, while Battery focuses on a single target, and Fade to Black rewards overall playfield activity.`,
        order_idx: 10,
        facts: {
          for_whom: '15 inserts (3 per shot), columns/rows bonus',
          fade_to_black: 'switch hits build jackpot, progress bar',
          battery: '12 Sparky shots, ramps/orbits boost value',
          enter_sandman: '15 inserts solid, alternating with switch hits',
          mystery_bonus: 'always Crank It Up Bonus during modes',
          re_collect: '25% jackpot via spider arrows + scoop',
          completion_reward: 'UNFORGIVEN letter + victory laps'
        }
      },
      {
        title: 'Side Modes',
        section_type: 'side_modes',
        body: `Side modes can be started at any time, even during multiball modes, so long as Crank it Up isn't currently running. Many side modes have ways to extend their timers, allowing them to potentially last for much longer than their initial timers.

**72 Seasons:**
Complete the four pick targets to light super spinner and qualify progress towards this frenzy mode. Once the targets are completed, making 72 switch hits will start 72 Seasons. Completing the pick targets again during the switch countdown will boost the value of each switch during the mode by an additional 25K.

Once 72 Seasons starts, a 72-second timer will start and all four pick targets will be lit to score toy jackpots worth a minimum of 200K. Each switch hit adds 50K to the jackpots (+50K if you were able to complete the pick targets multiple times prior). Hitting all four targets during 72 Seasons also awards a self-destruct button use.

**Hardwired Hurry-Up / Self-Destruct Buttons:**
Hit all five shots with hardwired inserts (the ramps, orbits, and grave marker targets) during single-ball, non-mode play to light the scoop to start Hardwired Hurry-Up. Continuing to hit shots with hardwired inserts flashing before shooting the scoop will increase the value for each hurry-up during the mode by 400K per shot.

Once Hardwired starts, all five shots will be lit to score a hurry-up value starting at 5M + any boosts prior, decreasing over time. The fifth, final shot is called the Hardwired jackpot and starts at the sum total of all four prior hurry-ups that were scored. Scoring the Hardwired jackpot also awards a self-destruct button use.

**FUEL Fast Scoring:**
Shoot the FUEL targets four times to add to the FUEL gauge and light the dead end target behind them for 2x Playfield. Once the FUEL gauge is completely full (after three completions of FUEL for the first attempt), the next shot to any of the targets will start the FUEL frenzy.

This frenzy mode allows big point scoring so long as the fuel gauge is maintained. Every switch hit scores a value that starts at 5K. Direct shots to the FUEL target add time, increase switch value by 1K (max 15K) and light the piston target for fuel jackpot (750K + 50K each time earned). Further FUEL frenzies require one additional FUEL completion to qualify.

**Lady Justice:**
Every shot to the left and right ramps scores a letter in METALLICA (2 letters earned by making ramp shots as combos). Once completed with 9 shots, shoot either ramp again to begin Lady Justice.

The goal is to "balance the scales" by alternating shots between left and right sides of the playfield. Values start at 750K (+250K each time played) and increase by 50K for each shot made there. Alternating shots between both sides scores current value plus 500K (+250K each time played). Making any shot if timer is under 15 seconds resets it to 15.`,
        order_idx: 11,
        facts: {
          side_mode_count: 6,
          stacking_allowed: 'except during Crank It Up',
          seasons_timer: '72 seconds',
          seasons_targets: '4 pick targets for toy jackpots',
          hardwired_shots: '5 shots (ramps, orbits, grave marker)',
          hardwired_boost: '400K per shot before starting',
          fuel_gauge: '3 completions to fill first time',
          fuel_switch_max: '15K per switch hit',
          lady_justice_requirement: '9 ramp shots for METALLICA',
          lady_justice_base: '750K + 250K per play'
        }
      },
      {
        title: 'Setlist Combos & Lux Aeterna',
        section_type: 'combos',
        body: `There are 14 unique setlist combos in the game that can only be earned when certain modes are running. Each setlist combo earned during the mode that matches it will award a self-destruct button and count down towards lighting Lux Aeterna at the piston target.

**Setlist Combo Requirements:**
- **5 setlist combo pairs** required to light Lux Aeterna
- **10 setlist combo pairs** will instead light the piston target for Frantic Multiball
- **All 14 pairs** will award a letter in UNFORGIVEN

**Lux Aeterna Mode:**
Can only be started if no other multiball or Crank it Up mode is running. This is a combo-based mode with ball save for its entire duration, which starts at 60 seconds and resets every time you advance a level but gets 5 seconds removed each time the ball drains.

**Level Progression:**
The goal is to score as many combos as possible, starting at 5x their normal value, and increasing by +1x for each level advanced. Advancing a level requires a combo of a certain length:
- **Levels 1-2:** 2-way combo required
- **Levels 3-5:** 3-way combo required  
- **Levels 6-9:** 4-way combo required
- **And so on...**

**Timer Management:**
If the mode timer is under 10 seconds, shooting a combo will reset the timer back to 10 seconds even if it doesn't complete the current level.

**Strategic Value:**
Setlist combos serve multiple purposes:
- Immediate self-destruct button award
- Progress toward Lux Aeterna (5 pairs)
- Progress toward Frantic Multiball (10 pairs)  
- UNFORGIVEN letter (all 14 pairs)

**Combo Strategy:**
Focus on learning which combos correspond to which modes to maximize setlist combo collection. The escalating combo length requirements in Lux Aeterna reward players who can consistently make longer combo sequences.

**Ball Save Advantage:**
The full-duration ball save in Lux Aeterna makes it an excellent mode for taking risks and attempting difficult combo sequences without fear of draining.`,
        order_idx: 12,
        facts: {
          total_combos: 14,
          lux_aeterna_requirement: '5 pairs',
          frantic_requirement: '10 pairs',
          unforgiven_requirement: '14 pairs',
          starting_multiplier: '5x combo value',
          level_multiplier: '+1x per level',
          timer_start: '60 seconds',
          timer_penalty: '-5s per drain',
          timer_reset: '10s minimum on combo',
          ball_save: 'entire mode duration',
          combo_lengths: '2-way → 3-way → 4-way progression'
        }
      },
      {
        title: 'Coffin Hurry-Ups & Seek & Destroy',
        section_type: 'mode',
        body: `**Coffin Hurry-Ups:**
Coffin hurry-ups are started by lighting all three items at any of the five major shots, then shooting the shot with the strobing inserts. They can also be automatically qualified through one of the super skill shots.

**Hurry-Up Values:**
Hurry-ups start at 750K + 50K × the total of all non-coffin items' shot levels, which increase as shots with the blue arrow and an item insert on it are made. The value increases by 750K × the number of active hurry-ups, if multiple hurry-ups are active at once.

Once a hurry-up is scored, the three items at the shot that was used to start it will be locked in and won't disappear until Seek & Destroy starts.

**Seek & Destroy:**
Seek & Destroy starts as soon as all five Coffin Hurry-Ups have been collected at the captive ball. This is a potentially lucrative mode that can last a long time if you keep making the required shots.

**Mode Mechanics:**
One randomly determined shot is lit to "seek" and score a jackpot worth 1M + 25K (+250K each time Seek & Destroy is played), while the remaining shots are solidly lit to score mini jackpots worth 50% of the jackpot value.

Once the required shot has been made, shoot the captive ball to "destroy" and score 500K + the sum of all previous jackpots & mini-jackpots (+100K each time the mode is played). Rinse and repeat until the timer runs out.

**Timer Management:**
Making required shots resets the timer to 15 seconds if needed, allowing skilled players to extend the mode significantly.

**Item Collection Bonus:**
All lit shots during Seek & Destroy add 1 of each item towards qualifying the next Crank it Up mode if it isn't already lit.

**Strategy:**
The key to Seek & Destroy is consistent shot-making to the lit "seek" target, followed by accurate captive ball shots to "destroy." The escalating jackpot values reward longer mode play, making timer management crucial.

**Multiple Hurry-Ups:**
Having multiple Coffin Hurry-Ups active simultaneously significantly increases their values, making it worthwhile to set up multiple hurry-ups before collecting them.`,
        order_idx: 13,
        facts: {
          hurry_up_base: '750K + 50K × item levels',
          multiple_bonus: '750K × active hurry-ups',
          seek_destroy_requirement: 'all 5 Coffin Hurry-Ups',
          seek_jackpot: '1M + 25K (+250K per play)',
          mini_jackpot: '50% of jackpot value',
          destroy_value: '500K + sum of jackpots (+100K per play)',
          timer_reset: '15 seconds on required shots',
          item_bonus: '1 of each item per lit shot',
          locked_items: 'until Seek & Destroy starts'
        }
      },
      {
        title: 'Other Scoring Features',
        section_type: 'scoring',
        body: `**2x Playfield:**
Every completion of the FUEL targets lights the dead end target for 2x playfield for 20 seconds. This multiplier is additive with the 2x playfield from the snake add-a-ball, meaning 4x scoring is possible during all multiball modes with both playfield multipliers active. The 2x playfield timer can be reset by hitting the dead end target again while 2x playfield is already running.

**Dead End Lane, Blown Pistons & Super Pistons:**
Blown pistons are lit at the dead end lane by hitting the bumpers - 10 hits are required per bumper. When the five rollover lanes that light mystery are completed, progress towards lighting blown pistons is temporarily doubled (starts as soon as the first bumper is hit and lasts 20 seconds, reset with bumper hits).

Up to three blown pistons can be lit at a time; continuing to hit the bumpers when any piston is solidly lit will level up the piston insert and start it flashing. Normally up to 3 pistons can be earned per dead end lane shot, but if all 3 are flashing, then 6 will be scored.

**Blown Piston Awards:**
- **3, 13, 23, etc.:** Awards a self-destruct button use
- **8, 18, 28, etc.:** Hold Bonus X
- **15, 40, 80, etc.:** Light Extra Ball

**Super Spinner:**
Light the orbits for super spinner by completing the four pick targets. Super spinner is indicated by an orange light at both orbits and lasts for as long as the spinner session lasts, awarding 100K per spin + 5K per target completion (+25K if the targets were completed from left to right). The orbit up-post will always lower if super spinner is lit to guarantee a full orbit shot.

**Resurrection (Ball Save):**
Resurrection is lit at both outlanes after hitting the grave marker drop targets enough times. The first Resurrection of a game requires 3 targets, increasing by 3 for each subsequent lighting up to a max of 12. Hitting a grave marker drop target as part of a combo will award additional hits towards resurrect based on the combo length.

The first time Resurrection is used in a game, both outlanes are lit separately from each other. Afterwards, draining down one lit outlane will unlight both of them.

**Self-Destruct Buttons:**
Self-destruct buttons are used by pressing the action button when flashing. When pressed, all currently lit items are collected (with one coffin awarded for each column of 3 items), and progress is made towards Hardwired Hurry-Up. A maximum of 3 can be earned at a time.`,
        order_idx: 14,
        facts: {
          max_playfield_multiplier: '4x (2x FUEL + 2x snake)',
          playfield_timer: '20 seconds (resettable)',
          bumper_requirement: '10 hits per piston',
          max_pistons: '3 (6 if all flashing)',
          piston_awards: 'self-destruct, hold bonus, extra ball',
          super_spinner_value: '100K + 5K per completion',
          left_to_right_bonus: '+25K per spin',
          resurrection_start: '3 targets',
          resurrection_max: '12 targets',
          combo_resurrection: 'hits = combo length',
          self_destruct_max: 3
        }
      },
      {
        title: 'Combos & Mystery',
        section_type: 'scoring',
        body: `**Combos & Combo Jackpot:**
Shooting shots that flow into each other consecutively without missing will award combos, indicated by the flashing red arrows. Combos also increase the progression towards specific features if they are the last shots made in the combo:

- **Dead-end lane:** Combo jackpot is awarded. Starts at 750K each ball and remains boosted by 2-way combos until collected, at which point it resets to 750K + 250K × number of shots made in the combo chain before hitting the dead-end lane
- **Grave marker targets:** Progress towards lighting Resurrection ball save is advanced by the number of shots in the combo
- **Left and right ramps:** 2 METALLICA letters are awarded for each ramp shot made in the combo
- **Captive ball:** Coffin item hits and lock progress are advanced by the number of shots in the combo

**Combo Scoring:**
Each combo scores points on its own: 250K + 500K × (combo length greater than 2-way) + 7.5K × (number of combo sequences before this one, this ball).

**Extra Ball from Combos:**
Extra Ball is lit after shooting 15, then 50, then every 50 combos after that.

**Mystery:**
Complete all 5 rollover lanes (3 inlanes, 2 above pop bumpers), which alternate with the flippers, to enable super pistons and light Mystery at the scoop. Complete them multiple times for better awards, up to level 4.

**Mystery Awards by Level:**
- **Level 1:** Points, Light Extra Ball, Advance Bonus X, etc.
- **Level 2:** Higher points, Self-Destruct Button, METALLICA Letters, etc.
- **Level 3:** Self-Destruct Button, Spot Items, Light Multiball, etc.
- **Level 4:** 2 Self-Destruct Buttons, Spot Hurry-Up, Hold Bonus X, etc.

**Crank It Up Mystery:**
During Crank It Up modes, Mystery always awards "Crank It Up Bonus", worth the value of the next required shot and any associated bonuses. The mystery level does not affect this award.

**Strategy:**
Combos are essential for efficient progression in multiple systems. Focus on learning combo flows, especially those ending at the captive ball for coffin collection and grave markers for resurrection. The mystery system provides valuable awards, with level 4 being particularly powerful for self-destruct buttons.`,
        order_idx: 15,
        facts: {
          combo_jackpot_base: '750K per ball',
          combo_jackpot_reset: '750K + 250K × combo length',
          combo_scoring: '250K + 500K × (length-2) + 7.5K × sequences',
          extra_ball_combos: '15, 50, then every 50',
          mystery_levels: 4,
          mystery_lanes: '5 rollovers (3 inlanes, 2 bumpers)',
          crank_it_up_mystery: 'always Crank It Up Bonus',
          combo_benefits: 'resurrection, METALLICA letters, coffin hits'
        }
      },
      {
        title: 'Blackened (Mini-Wizard Mode)',
        section_type: 'wizard_mode',
        body: `**Qualification:** Light the scoop for this mini-wizard mode by playing all four multiball modes - electric chair, grave marker, snake, and coffin - in the same game. If Crank it Up is also lit at the scoop, the player will be prompted to choose between the two modes, with the left flipper starting Crank it Up and the right flipper starting Blackened.

**Mode Concept:**
Sparky's had enough of the band shocking him and gives them a taste of their own medicine. This 4-ball multiball starts by tallying up the total level of each band member and calculating the jackpot based on them.

**Jackpot Calculation:**
The jackpot starts at 800K, and is increased by 100K × the total levels of all band members.

**Band Member Level Benefits:**
Band members at level 8 provide additional benefits:
- **1 member at level 8:** 1 add-a-ball button
- **2 members at level 8:** 1 add-a-ball button, 1 additional ball at the start of multiball
- **3 members at level 8:** 2 add-a-ball buttons, 1 additional ball at the start of multiball
- **4 members at level 8:** 2 add-a-ball buttons, 2 additional balls at the start of multiball

**Multiball Mechanics:**
During the multiball, all playfield scoring is multiplied by the balls in play minus 1 (maximum obtainable is 5x with 6 balls in play). All shots are lit red for awards that build the super jackpot, but only one shot is lit purple to score the jackpot value.

The purple shot starts at the far left of the playfield (dead-end target) and moves to the right either when it is hit or when the captive ball is shot. Hitting the flashing purple shot relights the red award shots, and "blackens" the shot that was made (further shots to them will add 250K to the jackpot).

**Super Jackpot:**
Turning all six shots purple will score the super jackpot, award a self-destruct button, and award a letter in UNFORGIVEN.

**Add-a-Ball Timing:**
Add-a-balls are given after 3 shots have been blackened, or the super jackpot has been scored.

**Strategy:**
Focus on advancing band members to level 8 before attempting Blackened for maximum benefits. The playfield multiplier makes this an excellent scoring opportunity, especially with 5x scoring at 6 balls. Prioritize keeping balls alive to maintain the high multiplier.

**UNFORGIVEN Progress:**
The letter awarded for super jackpot completion is crucial for qualifying the super wizard mode, making Blackened completion a key milestone.`,
        order_idx: 16,
        facts: {
          qualification: 'all 4 main multiballs',
          ball_count: '4-ball (up to 6 with level 8 members)',
          jackpot_base: '800K + 100K × total member levels',
          playfield_multiplier: '(balls in play - 1)x, max 5x',
          max_balls: '6 balls in play',
          purple_shot_movement: 'left to right, hit or captive ball',
          blackened_bonus: '250K per subsequent shot',
          super_jackpot_requirement: 'all 6 shots purple',
          add_ball_timing: '3 shots blackened or super jackpot',
          unforgiven_letter: 'super jackpot completion'
        }
      },
      {
        title: 'End of the Line (Wizard Mode)',
        section_type: 'wizard_mode',
        body: `**Qualification:** Once all 4 Crank it Up modes have been played (they don't need to be completed or cashed out), collect enough items to light the 5th Crank it Up mode and shoot the scoop to start End of the Line.

**Starting Bonus:**
At the start of End of the Line, you receive a hefty bonus for all the items you've collected in the game. This appears to be 200K per number of items collected throughout your game.

**Mode Structure:**
End of the Line is the culmination of the Crank It Up progression, representing the ultimate risk/reward decision in Metallica. Like other Crank It Up modes, it involves building up a jackpot value through shooting flashing shots, but with significantly higher stakes and rewards.

**Continued Scoring:**
Until the player qualifies Crank It Up again, they can continue to cash out 25% of the final collect for the remainder of the ball, providing ongoing scoring opportunities even after the main mode concludes.

**Strategic Considerations:**
- This mode represents the ultimate test of risk/reward decision making that Metallica is famous for
- The starting bonus alone can be substantial if you've collected many items throughout the game
- The ability to continue collecting 25% of the final value provides insurance for the rest of the ball
- Since it requires playing all 4 Crank It Up modes, it represents significant time investment and skill

**Preparation Strategy:**
To maximize End of the Line value:
- Focus on item collection throughout the game
- Play all 4 Crank It Up modes (completion not required, but recommended for higher scores)
- Build up self-destruct buttons and other resources before starting
- Ensure good ball control skills for the long mode duration

**Legacy Value:**
End of the Line represents the pinnacle of Metallica's risk/reward philosophy that influenced many subsequent Stern designs. The decision of when to cash out versus continuing to build the jackpot embodies the core tension that makes Metallica compelling.`,
        order_idx: 17,
        facts: {
          qualification: 'all 4 Crank It Up modes played',
          starting_bonus: '200K × total items collected',
          continued_scoring: '25% of final collect remainder of ball',
          completion_requirement: 'modes played, not completed',
          risk_reward: 'ultimate cash out vs continue decision',
          influenced_design: 'shaped subsequent Stern releases',
          preparation_key: 'item collection and ball control skills'
        }
      },
      {
        title: 'The Unforgiven (Super Wizard Mode)',
        section_type: 'super_wizard_mode',
        body: `**Qualification:** This super wizard mode starts as soon as UNFORGIVEN is spelled and no other modes are currently running. Spelling UNFORGIVEN requires completion of every other major task in the game:

**UNFORGIVEN Letter Requirements:**
- **Each band member advanced to level 8** awards a letter (4 letters total)
- **Scoring the completion bonus during any Crank it Up mode** awards a letter (4 letters total)
- **Collecting 100M combined in FUEL, Lady Justice, and Seek & Destroy** awards a letter
- **Scoring all 14 setlist combo pairs** awards a letter
- **Collecting 100 combos** awards a letter (+100 for every time this super wizard mode is played)
- **Scoring the super jackpot during Blackened** awards a letter

**Mode Structure - Part I:**
Shoot spinners for big points. Once you make 72 spins, the 72 Seasons targets will light for a jackpot. Each spin increases in value until you haven't hit a spinner in 5 seconds, then resets in value (and unlights if you've reached the next jackpot threshold). The toy jackpot at the 72 Seasons target is worth more depending on how many 72 Seasons toys you've collected.

**Mode Structure - Part II:**
Shoot lit shots to score Hardwired hurry-ups. Make shots with a flashing Hardwired circular insert on them to add a multiplier to the hurry up value for big points!

**Mode Structure - Part III:**
All shots start with Electric Chair inserts blinking. Shoot the grave marker to change inserts to Grave Markers, or Snake jaw to change the inserts to Snakes. Shooting a shot with a blinking item insert will award the item jackpot and turn that flashing insert solid.

The base value of the item jackpot increases each time you make any item shot with solidly lit items already at that shot. The jackpot increases more if there are more solidly lit items on a shot. The item jackpot also gains a multiplier by how many items you have already made on that shot.

Every column of items completed, or every 10 hits to the coffin, will add a ball into play. The coffin scores increasing millions of points until you reach 50 hits, then the coffin will unlight. Turn all item shots solid and make 50 coffin hits to light the coffin magnet to hold the ball for 9 seconds. Knock the ball off the coffin to score super jackpot and advance to victory laps.

**Victory Laps:**
Each shot starts lit for the item jackpot value, and unlights once hit. Make all 6 shots to increase the jackpot multiplier (up to 3x) and light the scoop for super jackpot. Scoring a super jackpot will add a ball and reset the jackpot multiplier.

**Ultimate Achievement:**
The Unforgiven represents the ultimate achievement in Metallica, requiring mastery of virtually every system in the game and significant time investment across multiple balls.`,
        order_idx: 18,
        facts: {
          letter_sources: 6,
          band_member_letters: '4 (level 8 each)',
          crank_it_up_letters: '4 (completion bonus each)',
          side_mode_requirement: '100M combined FUEL/Lady Justice/Seek & Destroy',
          combo_requirements: '14 setlist pairs + 100 combos',
          blackened_letter: 'super jackpot',
          part_1_requirement: '72 spinner hits',
          part_3_coffin_requirement: '50 hits',
          victory_lap_multiplier: 'up to 3x',
          ultimate_achievement: 'mastery of all systems required'
        }
      },
      {
        title: 'Extra Balls & End-of-Ball Bonus',
        section_type: 'bonus',
        body: `**Extra Ball Sources:**
Extra Balls can be lit to collect at the scoop by:
- **Shooting the captive ball** 10, then 50, 100, etc. times (first extra ball is percentage-based and can be as low as 5)
- **15, 50, 100, etc. Combos**
- **15, 40, 80, etc. Blown Pistons**

If the extra ball cap has been reached, extra ball awards 2.5M instead.

**End-of-Ball Bonus:**
Bonus is determined by calculating the number of items the player has collected over the course of the game, multiplied by the bonus X (which increases with shots to the inline drop targets).

**Bonus Multiplier:**
The bonus multiplier can be held by:
- Scoring enough blown pistons (8, 18, 28, etc.)
- Rare level 4 mystery award

**Strategic Bonus Building:**
- Focus on item collection throughout the game for maximum bonus base
- Build bonus multiplier through grave marker drop target hits
- Use blown pistons strategically to hold bonus multiplier
- The bonus system rewards consistent item collection across the entire game

**Bonus Calculation:**
**Total Bonus = (Total Items Collected) × (Bonus Multiplier)**

This simple but effective bonus system encourages players to focus on the core item collection mechanic that drives progression throughout the game. Since items are required for Crank It Up modes and contribute to bonus, there's a natural alignment between mode progression and bonus building.

**Hold Bonus Strategy:**
Since bonus multiplier can be held through blown pistons or mystery awards, it's valuable to build up the multiplier early in the game and then hold it for subsequent balls. This makes the grave marker drop targets particularly valuable early in each ball.

**Item Collection Focus:**
The bonus system reinforces the importance of the four main item types (Electric Chairs, Grave Markers, Snakes, Coffins) that are central to Metallica's progression systems. Every item collected serves both immediate mode progression and long-term bonus building.`,
        order_idx: 19,
        facts: {
          extra_ball_sources: 3,
          captive_ball_progression: '10, 50, 100+ times',
          combo_progression: '15, 50, 100+ combos',
          piston_progression: '15, 40, 80+ pistons',
          extra_ball_substitute: '2.5M if capped',
          bonus_calculation: 'items × bonus multiplier',
          hold_bonus_sources: 'pistons (8, 18, 28+) or level 4 mystery',
          bonus_multiplier_source: 'grave marker drop targets',
          item_types: 4
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

    console.log('🎉 Metallica seeding completed successfully!');
    console.log(`📊 Added ${ruleSections.length} rule sections`);
    console.log('💡 Run "npm run reindex" to update Meilisearch with the new game');

  } catch (error) {
    console.error('❌ Error seeding Metallica:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedMetallica().catch((err) => {
  console.error('❌ Metallica seeding failed:', err);
  process.exit(1);
});
