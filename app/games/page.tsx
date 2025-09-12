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
  searchParams: SearchParams;
}

async function GamesContent({ searchParams }: GamesPageProps) {
  const query = searchParams.q;
  let games;

  try {
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
  } catch (error) {
    console.error('Error fetching games:', error);
    games = [];
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
        
        <form method="GET" className="flex gap-4 max-w-md">
          <Input
            name="q"
            placeholder="Search games..."
            defaultValue={query}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        
        {query && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {games.length} result{games.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <Link href="/games" className="text-sm text-blue-600 hover:underline">
              Clear search
            </Link>
          </div>
        )}
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {query ? 'No games found' : 'No games available'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {query 
              ? 'Try adjusting your search terms or browse all games.' 
              : 'Check back later or add some games via the admin panel.'
            }
          </p>
          {query && (
            <Link href="/games">
              <Button variant="outline">Browse All Games</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription>
                    {game.manufacturer && game.year 
                      ? `${game.manufacturer} (${game.year})`
                      : game.manufacturer || game.year || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {game.system && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {game.system}
                      </span>
                    )}
                    {game.ipdb_id && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        IPDB #{game.ipdb_id}
                      </span>
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
        <div className="flex gap-4 max-w-md">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
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
