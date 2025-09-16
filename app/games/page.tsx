import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getGames, searchGames } from '@/lib/db';
import { searchGames as searchGamesInMeili } from '@/lib/meili';

interface SearchParams {
  q?: string;
}

interface GamesPageProps {
  searchParams: Promise<SearchParams>;
}

async function GamesContent({ searchParams }: GamesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q;
  let games;

  if (query) {
    // Try Meilisearch first, fallback to PostgreSQL
    try {
      const meiliResults = await searchGamesInMeili(query);
      games = meiliResults.hits.map(hit => ({
        id: hit.id,
        title: hit.title,
        manufacturer: hit.manufacturer,
        year: hit.year,
        system: hit.system,
        ipdb_id: hit.ipdb_id,
        pinside_id: hit.pinside_id,
      }));
    } catch (meiliError) {
      console.warn('Meilisearch unavailable, falling back to PostgreSQL:', meiliError);
      games = await searchGames(query);
    }
  } else {
    games = await getGames();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Pinball Games
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Browse and search through our collection of pinball machine rules
        </p>
        
        {/* Search Form */}
        <form className="flex gap-4 mb-6" method="GET">
          <Input
            type="text"
            name="q"
            placeholder="Search games..."
            defaultValue={query || ''}
            className="flex-1"
          />
          <Button type="submit">
            Search
          </Button>
          {query && (
            <Link href="/games">
              <Button variant="outline">
                Clear
              </Button>
            </Link>
          )}
        </form>

        {query && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {games.length === 0 ? 'No results' : `${games.length} result${games.length === 1 ? '' : 's'}`} for "{query}"
            </p>
          </div>
        )}
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {query ? 'No games found matching your search.' : 'No games available.'}
          </p>
          {query && (
            <Link href="/games">
              <Button variant="outline">
                View All Games
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription>
                    {game.manufacturer && game.year ? (
                      `${game.manufacturer} • ${game.year}`
                    ) : game.manufacturer ? (
                      game.manufacturer
                    ) : game.year ? (
                      game.year.toString()
                    ) : (
                      'Unknown'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {game.system && (
                      <div className="text-sm">
                        <span className="text-gray-500">System:</span>
                        <span className="ml-2 font-medium">{game.system}</span>
                      </div>
                    )}
                    {game.ipdb_id && (
                      <div className="text-sm">
                        <span className="text-gray-500">IPDB:</span>
                        <span className="ml-2 font-medium">#{game.ipdb_id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function GamesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-6 animate-pulse"></div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GamesPage({ searchParams }: GamesPageProps) {
  return (
    <Suspense fallback={<GamesLoading />}>
      <GamesContent searchParams={searchParams} />
    </Suspense>
  );
}