import { Pool } from 'pg';
import { generateEmbedding } from '../lib/embeddings';

async function addMacheteSection() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'pinball_rules',
    user: 'postgres',
    password: 'password',
  });

  try {
    console.log('🔪 Adding missing Machetes section to Jaws...');

    // Get the Jaws ruleset ID
    const rulesetResult = await pool.query(`
      SELECT r.id FROM rulesets r 
      JOIN games g ON r.game_id = g.id 
      WHERE g.title = 'Jaws'
    `);

    if (rulesetResult.rows.length === 0) {
      throw new Error('Jaws ruleset not found');
    }

    const rulesetId = rulesetResult.rows[0].id;
    console.log(`✅ Found Jaws ruleset: ${rulesetId}`);

    // Define the machete section
    const macheteSection = {
      section_type: 'feature',
      title: 'Machetes (Shot Multipliers)',
      body: `Completing the left target bank while "light machete" is lit will light a return lane for "machete". This corresponds to a shot multiplier, awarded on the next shot made after either rolling through the lit return lane, or shooting a ramp that feeds the general area of that lane. If the base machete multiplier is at 4x, then the harpoon lane must be hit to relight "light machete" at the target bank.

The machete multiplier starts at 2x and can be increased by +1x permanently by:
- Completing any shark encounter
- Catching a bounty hunt shark (excluding Mako) on the first attempt  
- Completing night search multiball

And temporarily increased from:
- Completing the drop targets while a Machete is available (+1x)
- Successfully rescuing Pipit (1st and 7th+ awards of a set, or given if any award is already active) (+1x)
- Collecting the +3x Machete wheel award (Prem / LE) (+3x)

Machete cannot be lit during multiballs unless lit via Pipit, or during wizard modes, but they can be brought into them at their current value.`,
      facts: {
        starting_multiplier: '2x',
        max_base_multiplier: '4x',
        permanent_increases: ['shark encounters', 'bounty hunt sharks (not Mako)', 'night search multiball'],
        temporary_increases: ['drop targets +1x', 'Pipit +1x', 'wheel award +3x'],
        multiball_restriction: 'Cannot be lit during multiballs (except via Pipit)'
      }
    };

    console.log('📝 Generating embedding...');
    
    // Generate embedding
    let embedding = null;
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length > 40) {
      try {
        const embeddingText = `${macheteSection.title}\n${macheteSection.body}`;
        embedding = await generateEmbedding(embeddingText);
      } catch (error) {
        console.log(`⚠️  Skipping embedding (OpenAI error):`, error);
        embedding = null;
      }
    } else {
      console.log(`⚠️  Skipping embedding (no OpenAI API key)`);
    }

    // Get the next order index
    const maxOrderResult = await pool.query(`
      SELECT COALESCE(MAX(order_idx), 0) as max_order 
      FROM rule_sections 
      WHERE ruleset_id = $1
    `, [rulesetId]);

    const nextOrder = maxOrderResult.rows[0].max_order + 1;

    // Insert the section
    await pool.query(`
      INSERT INTO rule_sections (ruleset_id, section_type, title, body, facts, order_idx, embedding)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      rulesetId,
      macheteSection.section_type,
      macheteSection.title,
      macheteSection.body,
      JSON.stringify(macheteSection.facts),
      nextOrder,
      embedding ? `[${embedding.join(',')}]` : null
    ]);

    console.log('✅ Added Machetes section to Jaws!');
    console.log(`Order index: ${nextOrder}`);

  } catch (error) {
    console.error('❌ Error adding Machetes section:', error);
  } finally {
    await pool.end();
  }
}

addMacheteSection();
