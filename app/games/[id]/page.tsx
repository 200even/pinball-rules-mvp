import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGameById, getRulesetsByGameId, getRuleSectionsByRulesetId } from '@/lib/db';
import { AskAIComponent } from '@/components/ask-ai-component';

interface GamePageProps {
  params: { id: string };
}

async function GameContent({ params }: GamePageProps) {
  const game = await getGameById(params.id);
  
  if (!game) {
    notFound();
  }

  const rulesets = await getRulesetsByGameId(game.id);
  
  // Get rule sections for all rulesets
  const allRuleSections = [];
  for (const ruleset of rulesets) {
    const sections = await getRuleSectionsByRulesetId(ruleset.id);
    allRuleSections.push({
      ruleset,
      sections: sections.sort((a, b) => a.order_idx - b.order_idx),
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Game Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {game.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {game.manufacturer && (
            <div>
              <span className="text-sm text-gray-500">Manufacturer:</span>
              <span className="ml-2 font-medium">{game.manufacturer}</span>
            </div>
          )}
          {game.year && (
            <div>
              <span className="text-sm text-gray-500">Year:</span>
              <span className="ml-2 font-medium">{game.year}</span>
            </div>
          )}
          {game.system && (
            <div>
              <span className="text-sm text-gray-500">System:</span>
              <span className="ml-2 font-medium">{game.system}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {game.ipdb_id && (
            <Badge variant="secondary">
              <a 
                href={`https://www.ipdb.org/machine.cgi?id=${game.ipdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                IPDB #{game.ipdb_id}
              </a>
            </Badge>
          )}
          {game.pinside_id && (
            <Badge variant="secondary">
              <a 
                href={`https://pinside.com/pinball/machine/${game.pinside_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Pinside #{game.pinside_id}
              </a>
            </Badge>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Ask AI Assistant
            </CardTitle>
            <CardDescription>
              Ask specific questions about {game.title} rules and get instant answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AskAIComponent gameId={game.id} gameName={game.title} />
          </CardContent>
        </Card>
      </div>

      {/* Rules Content */}
      {allRuleSections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No rules available
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Rules for this game haven't been added yet.
            </p>
            <Button variant="outline" asChild>
              <a href="/admin">Add Rules</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {allRuleSections.map(({ ruleset, sections }) => (
            <div key={ruleset.id}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rules
                  {ruleset.rom_version && (
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-300 ml-2">
                      (ROM: {ruleset.rom_version})
                    </span>
                  )}
                </h2>
                {ruleset.provenance && Object.keys(ruleset.provenance).length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Source:</span>
                    <span className="ml-2">
                      {ruleset.provenance.source || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {section.title}
                        <Badge variant="outline" className="text-xs">
                          {section.section_type}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section.body}
                        </ReactMarkdown>
                      </div>
                      
                      {section.facts && Object.keys(section.facts).length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Quick Facts:
                          </h4>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            {Object.entries(section.facts).map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GameLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 animate-pulse"></div>
        <div className="flex gap-4 mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="flex gap-2 mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GamePage({ params }: GamePageProps) {
  return (
    <Suspense fallback={<GameLoading />}>
      <GameContent params={params} />
    </Suspense>
  );
}
