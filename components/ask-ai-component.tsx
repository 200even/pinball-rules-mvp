'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Source {
  id: string;
  title: string;
  body: string;
  game_title?: string;
  rom_version?: string;
  section_type: string;
  similarity?: number;
  source: string;
}

interface AIResponse {
  answer: string;
  sources: Source[];
  query: string;
}

interface Props {
  gameId?: string;
  gameName?: string;
}

export function AskAIComponent({ gameId, gameName }: Props) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

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
        if (res.status === 401) {
          setError('Authentication required. Please sign up to access AI assistance.');
          return;
        }
        if (res.status === 402) {
          setError('Subscription required. Please upgrade your plan to access AI assistance.');
          return;
        }
        if (res.status === 429) {
          setError('AI service is busy. Please try again in a few minutes.');
          return;
        }
        if (res.status === 503) {
          setError('AI service is temporarily unavailable. Please try again later.');
          return;
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await res.json();
      setResponse(data.data);
      
    } catch (err) {
      console.error('Error asking AI:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearResponse = () => {
    setResponse(null);
    setError(null);
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Rules Assistant
            {gameName && (
              <Badge variant="secondary" className="text-xs">
                {gameName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask me anything about ${gameName || 'pinball'} rules...`}
                className="min-h-[100px]"
                disabled={loading}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Try asking: "How do you start multiball?", "What are the high-value shots?", or "How does the bonus system work?"
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={!question.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Thinking...' : 'Ask AI'}
              </Button>
              {(response || error) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleNewQuestion}
                  disabled={loading}
                >
                  New Question
                </Button>
              )}
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </div>
              {error.includes('Authentication') && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-300">
                  This app will require user authentication and a subscription to access AI features.
                </div>
              )}
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    💡 AI Answer
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearResponse}
                      className="ml-auto"
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="prose dark:prose-invert max-w-none">
                    {response.answer.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {response.sources.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">📚 Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {response.sources.map((source, idx) => (
                      <div 
                        key={source.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              [{idx + 1}]
                            </Badge>
                            <h4 className="font-medium text-sm">
                              {source.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {source.game_title && (
                              <Badge variant="secondary" className="text-xs">
                                {source.game_title}
                                {source.rom_version && ` (${source.rom_version})`}
                              </Badge>
                            )}
                            <Badge 
                              variant={source.source === 'vector' ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              {source.source}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {source.body.length > 200 
                            ? `${source.body.substring(0, 200)}...` 
                            : source.body
                          }
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}