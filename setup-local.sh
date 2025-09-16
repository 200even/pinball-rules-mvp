#!/bin/bash

echo "🚀 Setting up Pinball Rules MVP for local development..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   https://docs.docker.com/desktop/install/mac-install/"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not available. Please install Docker Desktop which includes docker-compose."
    exit 1
fi

echo "✅ Docker is available"

# Start services
echo "🐳 Starting PostgreSQL and Meilisearch services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Services failed to start. Check docker-compose logs:"
    docker-compose logs
    exit 1
fi

echo "✅ Services are running"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists and has OpenAI key
if [ -f ".env.local" ]; then
    if grep -q "sk-your-openai-api-key-here" .env.local; then
        echo ""
        echo "⚠️  IMPORTANT: Please add your OpenAI API key to .env.local"
        echo "   Edit .env.local and replace 'sk-your-openai-api-key-here' with your actual OpenAI API key"
        echo "   You can get one at: https://platform.openai.com/api-keys"
        echo ""
        read -p "Press Enter after you've added your OpenAI API key..."
    fi
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Check your database connection."
    exit 1
fi

echo "✅ Migrations completed"

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Seeding failed. This might be due to missing OpenAI API key."
    echo "   Make sure you've added a valid OpenAI API key to .env.local"
    exit 1
fi

echo "✅ Database seeded with Attack from Mars and Godzilla"

echo ""
echo "🎉 Setup complete! You can now:"
echo "   1. Start the development server: npm run dev"
echo "   2. Visit http://localhost:3000"
echo "   3. Try the admin panel at http://localhost:3000/admin"
echo ""
echo "📊 Services running:"
echo "   - Next.js app: http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Meilisearch: http://localhost:7700"
echo ""
echo "🛑 To stop services later: docker-compose down"
