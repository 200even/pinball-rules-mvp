'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Game {
  id?: string;
  title: string;
  manufacturer?: string;
  year?: number;
  system?: string;
  ipdb_id?: number;
  pinside_id?: number;
}

interface ProcessingStatus {
  step: string;
  progress: number;
  message: string;
}

export default function AdminPage() {
  const [game, setGame] = useState<Game>({
    title: '',
    manufacturer: '',
    year: undefined,
    system: '',
    ipdb_id: undefined,
    pinside_id: undefined,
  });
  
  const [rulesMarkdown, setRulesMarkdown] = useState('');
  const [romVersion, setRomVersion] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGameChange = (field: keyof Game, value: string | number) => {
    setGame(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!game.title.trim() || !rulesMarkdown.trim()) {
      setError('Game title and rules markdown are required');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      // Step 1: Create game
      setStatus({ step: 'Creating game...', progress: 10, message: 'Saving game information' });
      
      const gameResponse = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      
      if (!gameResponse.ok) {
        throw new Error('Failed to create game');
      }
      
      const createdGame = await gameResponse.json();
      
      // Step 2: Create ruleset
      setStatus({ step: 'Creating ruleset...', progress: 25, message: 'Setting up rules structure' });
      
      const rulesetResponse = await fetch('/api/admin/rulesets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: createdGame.id,
          rom_version: romVersion || undefined,
          provenance: { source: 'manual_upload', uploaded_at: new Date().toISOString() },
        }),
      });
      
      if (!rulesetResponse.ok) {
        throw new Error('Failed to create ruleset');
      }
      
      const createdRuleset = await rulesetResponse.json();
      
      // Step 3: Process markdown and create sections
      setStatus({ step: 'Processing markdown...', progress: 40, message: 'Parsing rules sections' });
      
      const sectionsResponse = await fetch('/api/admin/process-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleset_id: createdRuleset.id,
          markdown: rulesMarkdown,
        }),
      });
      
      if (!sectionsResponse.ok) {
        throw new Error('Failed to process markdown');
      }
      
      const sections = await sectionsResponse.json();
      
      // Step 4: Generate embeddings
      setStatus({ step: 'Generating embeddings...', progress: 70, message: 'Creating AI embeddings' });
      
      const embeddingsResponse = await fetch('/api/admin/generate-embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_ids: sections.map((s: any) => s.id),
        }),
      });
      
      if (!embeddingsResponse.ok) {
        throw new Error('Failed to generate embeddings');
      }
      
      // Step 5: Index in Meilisearch
      setStatus({ step: 'Indexing for search...', progress: 90, message: 'Adding to search index' });
      
      const indexResponse = await fetch('/api/admin/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: createdGame.id,
        }),
      });
      
      if (!indexResponse.ok) {
        console.warn('Search indexing failed, but continuing...');
      }
      
      setStatus({ step: 'Complete!', progress: 100, message: 'Rules successfully uploaded' });
      
      setResult({
        game: createdGame,
        ruleset: createdRuleset,
        sections_count: sections.length,
      });
      
      // Reset form
      setGame({
        title: '',
        manufacturer: '',
        year: undefined,
        system: '',
        ipdb_id: undefined,
        pinside_id: undefined,
      });
      setRulesMarkdown('');
      setRomVersion('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Add new pinball games and upload their rules. The system will automatically parse the markdown, generate AI embeddings, and index for search.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Information */}
        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
            <CardDescription>
              Basic information about the pinball machine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Game Title *
                </label>
                <Input
                  value={game.title}
                  onChange={(e) => handleGameChange('title', e.target.value)}
                  placeholder="e.g., Attack from Mars"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Manufacturer
                </label>
                <Input
                  value={game.manufacturer || ''}
                  onChange={(e) => handleGameChange('manufacturer', e.target.value)}
                  placeholder="e.g., Bally, Williams, Stern"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Year
                </label>
                <Input
                  type="number"
                  value={game.year || ''}
                  onChange={(e) => handleGameChange('year', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 1995"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  System
                </label>
                <Input
                  value={game.system || ''}
                  onChange={(e) => handleGameChange('system', e.target.value)}
                  placeholder="e.g., WPC, Spike 2, SAM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  IPDB ID
                </label>
                <Input
                  type="number"
                  value={game.ipdb_id || ''}
                  onChange={(e) => handleGameChange('ipdb_id', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 4032"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pinside ID
                </label>
                <Input
                  type="number"
                  value={game.pinside_id || ''}
                  onChange={(e) => handleGameChange('pinside_id', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 233"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                ROM Version
              </label>
              <Input
                value={romVersion}
                onChange={(e) => setRomVersion(e.target.value)}
                placeholder="e.g., L-5, 1.66, Gold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rules Markdown */}
        <Card>
          <CardHeader>
            <CardTitle>Rules (Markdown)</CardTitle>
            <CardDescription>
              Paste the complete rules in Markdown format. Use headings (# ## ###) to structure sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rulesMarkdown}
              onChange={(e) => setRulesMarkdown(e.target.value)}
              placeholder={`# Game Overview
Brief description of the game...

## Multiball
How to start and play multiball...

## Wizard Mode
Requirements and gameplay for wizard mode...`}
              className="min-h-[300px] font-mono text-sm"
              required
            />
            <div className="mt-2 text-sm text-gray-500">
              {rulesMarkdown.length.toLocaleString()} characters
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={processing} size="lg">
            {processing ? 'Processing...' : 'Upload Rules'}
          </Button>
        </div>
      </form>

      {/* Processing Status */}
      {status && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{status.step}</span>
                <span>{status.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {status.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mt-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {result && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Success! Rules uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Game:</strong> {result.game.title}
              </p>
              <p>
                <strong>Sections created:</strong> {result.sections_count}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/games/${result.game.id}`}>View Game</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/games">Browse All Games</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Markdown Structure:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>Use # for main sections (Overview, Multiball, etc.)</li>
              <li>Use ## for subsections (Starting Multiball, Scoring, etc.)</li>
              <li>Use ### for detailed breakdowns</li>
              <li>The system will automatically split content by headings</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Processing Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300">
              <li>Game information is saved to database</li>
              <li>Ruleset record is created</li>
              <li>Markdown is parsed into individual sections</li>
              <li>AI embeddings are generated for semantic search</li>
              <li>Content is indexed in Meilisearch for keyword search</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
