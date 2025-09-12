import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Pinball Rules Archive
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your AI-powered assistant for pinball rules and strategies. Browse games, search rules, and get instant answers to your pinball questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/games">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Games
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Browse Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore comprehensive rulesheets for hundreds of pinball machines, from classic electromechanical games to modern Stern releases.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ask specific questions about game rules and get instant, accurate answers powered by AI and vector search technology.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find exactly what you're looking for with our hybrid search that combines keyword matching and semantic understanding.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Games
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Start exploring with some of the most popular pinball machines
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/games">
              <Button variant="outline">Attack from Mars</Button>
            </Link>
            <Link href="/games">
              <Button variant="outline">Godzilla</Button>
            </Link>
            <Link href="/games">
              <Button variant="outline">Medieval Madness</Button>
            </Link>
            <Link href="/games">
              <Button variant="outline">Twilight Zone</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}