import { generateEmbedding } from './embeddings';
import { searchSimilarSections, RuleSection } from './db';
import { searchRuleSections, RuleSectionDocument } from './meili';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface RetrievalResult {
  id: string;
  title: string;
  body: string;
  game_title?: string;
  rom_version?: string;
  section_type: string;
  similarity?: number;
  source: 'vector' | 'keyword';
}

export interface RAGResponse {
  answer: string;
  sources: RetrievalResult[];
  query: string;
}

// Hybrid retrieval combining vector similarity and keyword search
export async function hybridRetrieval(
  query: string,
  options: {
    gameId?: string;
    limit?: number;
    vectorThreshold?: number;
    keywordLimit?: number;
  } = {}
): Promise<RetrievalResult[]> {
  const {
    gameId,
    limit = 10,
    vectorThreshold = 0.7,
    keywordLimit = 5,
  } = options;

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Vector similarity search
    const vectorResults = await searchSimilarSections(
      queryEmbedding,
      Math.ceil(limit * 0.7), // 70% of results from vector search
      vectorThreshold,
      gameId // Add gameId parameter to filter by game
    );

    // Keyword search using Meilisearch
    const keywordResults = await searchRuleSections(query, {
      limit: keywordLimit,
      gameId,
    });

    // Combine and deduplicate results
    const combinedResults = new Map<string, RetrievalResult>();

    // Add vector results
    vectorResults.forEach((section: any) => {
      combinedResults.set(section.id, {
        id: section.id,
        title: section.title,
        body: section.body,
        game_title: section.game_title,
        rom_version: section.rom_version,
        section_type: section.section_type,
        similarity: section.similarity,
        source: 'vector',
      });
    });

    // Add keyword results (if not already present)
    keywordResults.hits.forEach((section) => {
      if (!combinedResults.has(section.id)) {
        combinedResults.set(section.id, {
          id: section.id,
          title: section.title,
          body: section.body,
          game_title: section.game_title,
          rom_version: section.rom_version,
          section_type: section.section_type,
          source: 'keyword',
        });
      }
    });

    // Convert to array and sort by relevance
    const results = Array.from(combinedResults.values());
    
    // Sort by similarity score (vector results first, then keyword results)
    results.sort((a, b) => {
      if (a.source === 'vector' && b.source === 'keyword') return -1;
      if (a.source === 'keyword' && b.source === 'vector') return 1;
      if (a.similarity && b.similarity) return b.similarity - a.similarity;
      return 0;
    });

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error in hybrid retrieval:', error);
    throw error;
  }
}

// Generate answer using OpenAI with retrieved context
export async function generateRAGResponse(
  query: string,
  gameId?: string
): Promise<RAGResponse> {
  try {
    // Retrieve relevant sections
    const retrievedSections = await hybridRetrieval(query, {
      gameId,
      limit: 8,
      vectorThreshold: 0.6,
    });

    if (retrievedSections.length === 0) {
      return {
        answer: "I couldn't find any relevant information in the pinball rules database to answer your question. Please try rephrasing your question or check if the game rules are available in our database.",
        sources: [],
        query,
      };
    }

    // Prepare context from retrieved sections
    const context = retrievedSections
      .map((section, index) => {
        const gameInfo = section.game_title 
          ? `${section.game_title}${section.rom_version ? ` (${section.rom_version})` : ''}`
          : 'Unknown Game';
        
        return `[${index + 1}] ${gameInfo} - ${section.title}\n${section.body}`;
      })
      .join('\n\n');

    // Generate response using OpenAI
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a pinball rules expert assistant. Your job is to answer questions about pinball game rules based ONLY on the provided rule sections.

IMPORTANT INSTRUCTIONS:
1. Only use information from the supplied rule sections - never make up or assume information
2. Always cite the specific sections you reference using the format [1], [2], etc.
3. If you prefer information from newer ROM versions, mention this preference
4. If the provided sections don't contain enough information to answer the question, say so clearly
5. Be concise but thorough in your explanations
6. Focus on practical gameplay advice when relevant

The rule sections are numbered [1], [2], etc. for easy citation.`,
        },
        {
          role: 'user',
          content: `Question: ${query}

Rule Sections:
${context}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const answer = completion.choices[0]?.message?.content || 'Unable to generate response.';

    return {
      answer,
      sources: retrievedSections,
      query,
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}

// Simple text search fallback when vector search is not available
export async function keywordOnlyRetrieval(
  query: string,
  gameId?: string,
  limit: number = 10
): Promise<RetrievalResult[]> {
  try {
    const results = await searchRuleSections(query, {
      limit,
      gameId,
    });

    return results.hits.map((section) => ({
      id: section.id,
      title: section.title,
      body: section.body,
      game_title: section.game_title,
      rom_version: section.rom_version,
      section_type: section.section_type,
      source: 'keyword' as const,
    }));
  } catch (error) {
    console.error('Error in keyword-only retrieval:', error);
    throw error;
  }
}
