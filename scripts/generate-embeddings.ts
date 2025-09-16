import { Pool } from 'pg';
import { generateEmbedding } from '../lib/embeddings';

async function generateEmbeddings() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'pinball_rules',
    user: 'postgres',
    password: 'password',
  });

  try {
    console.log('🚀 Generating embeddings for existing rule sections...');

    // Get all rule sections without embeddings
    const result = await pool.query(`
      SELECT id, title, body 
      FROM rule_sections 
      WHERE embedding IS NULL
      ORDER BY id
    `);

    console.log(`📝 Found ${result.rows.length} sections without embeddings`);

    for (const section of result.rows) {
      console.log(`Processing: ${section.title}`);
      
      // Generate embedding
      const embeddingText = `${section.title}\n${section.body}`;
      const embedding = await generateEmbedding(embeddingText);
      
      // Update the section with the embedding
      await pool.query(
        'UPDATE rule_sections SET embedding = $1 WHERE id = $2',
        [JSON.stringify(embedding), section.id]
      );
      
      console.log(`✅ Generated embedding for: ${section.title}`);
    }

    console.log('🎉 All embeddings generated successfully!');
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
  } finally {
    await pool.end();
  }
}

generateEmbeddings();
