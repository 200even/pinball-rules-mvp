'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface AskAIComponentProps {
  gameId?: string;
  gameName?: string;
}

interface AIResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    body: string;
    game_title?: string;
    rom_version?: string;
    section_type: string;
    similarity?: number;
    source: 'vector' | 'keyword';
  }>;
  query: string;
}

export function AskAIComponent({ gameId, gameName }: AskAIComponentProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question.trim(),
          gameId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await res.json();
      setResponse(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = gameId 
    ? [
        `How do you start multiball in ${gameName}?`,
        `What are the main scoring features?`,
        `How do you complete the wizard mode?`,
      ]
    : [
        'How do you start multiball in Attack from Mars?',
        'What are the rules for Medieval Madness castle?',
        'How does the Twilight Zone powerball work?',
      ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask a question about ${gameName || 'pinball rules'}...`}
            className="min-h-[100px]"
            disabled={loading}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {question.length}/1000 characters
          </div>
          <Button type="submit" disabled={loading || !question.trim()}>
            {loading ? 'Asking...' : 'Ask AI'}
          </Button>
        </div>
      </form>

      {/* Example Questions */}
      {!response && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Try asking:
          </h4>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuestion(example)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Response</CardTitle>
              <CardDescription>
                Question: {response.query}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{response.answer}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          {response.sources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Sources ({response.sources.length}):
              </h4>
              <div className="space-y-3">
                {response.sources.map((source, index) => (
                  <Card key={source.id} className="text-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          [{index + 1}] {source.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {source.section_type}
                          </Badge>
                          <Badge 
                            variant={source.source === 'vector' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {source.source}
                          </Badge>
                          {source.similarity && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(source.similarity * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      {source.game_title && (
                        <CardDescription className="text-xs">
                          {source.game_title}
                          {source.rom_version && ` (${source.rom_version})`}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                        {source.body.substring(0, 200)}
                        {source.body.length > 200 && '...'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ask Another Question */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setQuestion('');
                setResponse(null);
                setError(null);
              }}
              className="w-full"
            >
              Ask Another Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
