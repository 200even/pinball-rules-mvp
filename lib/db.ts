import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Types for our database models
export interface Game {
  id: string;
  title: string;
  manufacturer?: string;
  year?: number;
  system?: string;
  ipdb_id?: number;
  pinside_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Ruleset {
  id: string;
  game_id: string;
  rom_version?: string;
  provenance: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface RuleSection {
  id: string;
  ruleset_id: string;
  section_type: string;
  title: string;
  body: string;
  facts: Record<string, any>;
  order_idx: number;
  embedding?: number[];
  created_at: Date;
  updated_at: Date;
}

// Database helper functions
export async function getGames(): Promise<Game[]> {
  const result = await query('SELECT * FROM games ORDER BY title ASC');
  return result.rows;
}

export async function getGameById(id: string): Promise<Game | null> {
  const result = await query('SELECT * FROM games WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getRulesetsByGameId(gameId: string): Promise<Ruleset[]> {
  const result = await query(
    'SELECT * FROM rulesets WHERE game_id = $1 ORDER BY created_at DESC',
    [gameId]
  );
  return result.rows;
}

export async function getRuleSectionsByRulesetId(rulesetId: string): Promise<RuleSection[]> {
  const result = await query(
    'SELECT * FROM rule_sections WHERE ruleset_id = $1 ORDER BY order_idx ASC',
    [rulesetId]
  );
  return result.rows;
}

export async function searchGames(searchTerm: string): Promise<Game[]> {
  const result = await query(
    `SELECT * FROM games 
     WHERE to_tsvector('english', title || ' ' || COALESCE(manufacturer, '')) 
           @@ plainto_tsquery('english', $1)
     ORDER BY ts_rank(to_tsvector('english', title || ' ' || COALESCE(manufacturer, '')), 
                      plainto_tsquery('english', $1)) DESC`,
    [searchTerm]
  );
  return result.rows;
}

export async function createGame(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<Game> {
  const result = await query(
    `INSERT INTO games (title, manufacturer, year, system, ipdb_id, pinside_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [game.title, game.manufacturer, game.year, game.system, game.ipdb_id, game.pinside_id]
  );
  return result.rows[0];
}

export async function createRuleset(ruleset: Omit<Ruleset, 'id' | 'created_at' | 'updated_at'>): Promise<Ruleset> {
  const result = await query(
    `INSERT INTO rulesets (game_id, rom_version, provenance)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [ruleset.game_id, ruleset.rom_version, JSON.stringify(ruleset.provenance)]
  );
  return result.rows[0];
}

export async function createRuleSection(
  section: Omit<RuleSection, 'id' | 'created_at' | 'updated_at'>
): Promise<RuleSection> {
  const result = await query(
    `INSERT INTO rule_sections (ruleset_id, section_type, title, body, facts, order_idx, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      section.ruleset_id,
      section.section_type,
      section.title,
      section.body,
      JSON.stringify(section.facts),
      section.order_idx,
      section.embedding ? `[${section.embedding.join(',')}]` : null,
    ]
  );
  return result.rows[0];
}

export async function updateRuleSectionEmbedding(id: string, embedding: number[]): Promise<void> {
  await query(
    'UPDATE rule_sections SET embedding = $1 WHERE id = $2',
    [`[${embedding.join(',')}]`, id]
  );
}

export async function searchSimilarSections(
  embedding: number[],
  limit: number = 10,
  threshold: number = 0.8
): Promise<RuleSection[]> {
  const result = await query(
    `SELECT rs.*, g.title as game_title, r.rom_version,
            (1 - (rs.embedding <=> $1::vector)) as similarity
     FROM rule_sections rs
     JOIN rulesets r ON rs.ruleset_id = r.id
     JOIN games g ON r.game_id = g.id
     WHERE rs.embedding IS NOT NULL
       AND (1 - (rs.embedding <=> $1::vector)) > $3
     ORDER BY rs.embedding <=> $1::vector
     LIMIT $2`,
    [`[${embedding.join(',')}]`, limit, threshold]
  );
  return result.rows;
}
