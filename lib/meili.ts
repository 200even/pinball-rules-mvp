import { MeiliSearch } from 'meilisearch';

let client: MeiliSearch | null = null;

export function getMeiliClient(): MeiliSearch {
  if (!client) {
    client = new MeiliSearch({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY,
    });
  }
  return client;
}

// Index names
export const GAMES_INDEX = 'games';
export const RULE_SECTIONS_INDEX = 'rule_sections';

// Types for Meilisearch documents
export interface GameDocument {
  id: string;
  title: string;
  manufacturer?: string;
  year?: number;
  system?: string;
  ipdb_id?: number;
  pinside_id?: number;
}

export interface RuleSectionDocument {
  id: string;
  ruleset_id: string;
  game_id: string;
  game_title: string;
  rom_version?: string;
  section_type: string;
  title: string;
  body: string;
  facts: Record<string, any>;
  order_idx: number;
}

// Initialize indexes with proper settings
export async function initializeIndexes(): Promise<void> {
  const client = getMeiliClient();

  try {
    // Games index
    const gamesIndex = client.index(GAMES_INDEX);
    await gamesIndex.updateSettings({
      searchableAttributes: ['title', 'manufacturer', 'system'],
      filterableAttributes: ['manufacturer', 'year', 'system'],
      sortableAttributes: ['title', 'year'],
      displayedAttributes: ['id', 'title', 'manufacturer', 'year', 'system'],
    });

    // Rule sections index
    const ruleSectionsIndex = client.index(RULE_SECTIONS_INDEX);
    await ruleSectionsIndex.updateSettings({
      searchableAttributes: ['title', 'body', 'game_title', 'section_type'],
      filterableAttributes: ['game_id', 'section_type', 'rom_version'],
      sortableAttributes: ['order_idx'],
      displayedAttributes: [
        'id',
        'ruleset_id',
        'game_id',
        'game_title',
        'rom_version',
        'section_type',
        'title',
        'body',
        'order_idx',
      ],
    });

    console.log('Meilisearch indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing Meilisearch indexes:', error);
    throw error;
  }
}

// Index games
export async function indexGames(games: GameDocument[]): Promise<void> {
  const client = getMeiliClient();
  const index = client.index(GAMES_INDEX);

  try {
    const task = await index.addDocuments(games, { primaryKey: 'id' });
    console.log(`Indexed ${games.length} games, task ID: ${task.taskUid}`);
  } catch (error) {
    console.error('Error indexing games:', error);
    throw error;
  }
}

// Index rule sections
export async function indexRuleSections(sections: RuleSectionDocument[]): Promise<void> {
  const client = getMeiliClient();
  const index = client.index(RULE_SECTIONS_INDEX);

  try {
    const task = await index.addDocuments(sections, { primaryKey: 'id' });
    console.log(`Indexed ${sections.length} rule sections, task ID: ${task.taskUid}`);
  } catch (error) {
    console.error('Error indexing rule sections:', error);
    throw error;
  }
}

// Search games
export async function searchGames(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    filter?: string;
  } = {}
): Promise<{ hits: GameDocument[]; totalHits: number }> {
  const client = getMeiliClient();
  const index = client.index(GAMES_INDEX);

  try {
    const result = await index.search(query, {
      limit: options.limit || 20,
      offset: options.offset || 0,
      filter: options.filter,
    });

    return {
      hits: result.hits as GameDocument[],
      totalHits: result.estimatedTotalHits || 0,
    };
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
}

// Search rule sections
export async function searchRuleSections(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    filter?: string;
    gameId?: string;
  } = {}
): Promise<{ hits: RuleSectionDocument[]; totalHits: number }> {
  const client = getMeiliClient();
  const index = client.index(RULE_SECTIONS_INDEX);

  try {
    const filters = [];
    if (options.filter) filters.push(options.filter);
    if (options.gameId) filters.push(`game_id = "${options.gameId}"`);

    const result = await index.search(query, {
      limit: options.limit || 10,
      offset: options.offset || 0,
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
    });

    return {
      hits: result.hits as RuleSectionDocument[],
      totalHits: result.estimatedTotalHits || 0,
    };
  } catch (error) {
    console.error('Error searching rule sections:', error);
    throw error;
  }
}

// Delete documents
export async function deleteGameFromIndex(gameId: string): Promise<void> {
  const client = getMeiliClient();
  const index = client.index(GAMES_INDEX);

  try {
    await index.deleteDocument(gameId);
    console.log(`Deleted game ${gameId} from index`);
  } catch (error) {
    console.error('Error deleting game from index:', error);
    throw error;
  }
}

export async function deleteRuleSectionFromIndex(sectionId: string): Promise<void> {
  const client = getMeiliClient();
  const index = client.index(RULE_SECTIONS_INDEX);

  try {
    await index.deleteDocument(sectionId);
    console.log(`Deleted rule section ${sectionId} from index`);
  } catch (error) {
    console.error('Error deleting rule section from index:', error);
    throw error;
  }
}

// Clear all documents from indexes
export async function clearIndexes(): Promise<void> {
  const client = getMeiliClient();

  try {
    await client.index(GAMES_INDEX).deleteAllDocuments();
    await client.index(RULE_SECTIONS_INDEX).deleteAllDocuments();
    console.log('Cleared all documents from indexes');
  } catch (error) {
    console.error('Error clearing indexes:', error);
    throw error;
  }
}
