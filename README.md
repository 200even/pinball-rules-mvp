# Pinball Rules Archive MVP

An AI-powered pinball rules archive and Q&A assistant built with Next.js 14, PostgreSQL with pgvector, Meilisearch, and OpenAI.

## Features

- 🎯 **Browse Games**: Search and explore pinball machine rules
- 🤖 **AI Assistant**: Ask questions and get instant answers about game rules
- 🔍 **Hybrid Search**: Combines vector similarity and keyword search
- 📝 **Admin Panel**: Upload and manage game rules
- 🚀 **Railway Ready**: Optimized for Railway deployment

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with pgvector extension
- **Search**: Meilisearch for full-text search
- **AI**: OpenAI API for embeddings and chat completion
- **Deployment**: Docker + Railway

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL with pgvector extension
- Meilisearch instance
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/200even/pinball-rules-mvp.git
   cd pinball-rules-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/pinball_rules"
   OPENAI_API_KEY="sk-your-openai-api-key-here"
   MEILI_MASTER_KEY="your-meilisearch-master-key"
   MEILI_HOST="http://localhost:7700"
   NEXT_PUBLIC_MEILI_HOST="http://localhost:7700"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   VECTOR_DIM=1536
   ```

4. **Set up PostgreSQL**
   ```bash
   # Create database and enable pgvector
   createdb pinball_rules
   psql pinball_rules -c "CREATE EXTENSION vector;"
   ```

5. **Start Meilisearch**
   ```bash
   # Using Docker
   docker run -it --rm \
     -p 7700:7700 \
     -e MEILI_MASTER_KEY=your-master-key \
     getmeili/meilisearch:latest
   
   # Or install locally
   # See: https://docs.meilisearch.com/learn/getting_started/installation.html
   ```

6. **Run database migrations**
   ```bash
   npm run migrate
   ```

7. **Seed the database**
   ```bash
   npm run seed
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```

9. **Visit the application**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run reindex` - Reindex all content in Meilisearch
- `npm run lint` - Run ESLint

## Railway Deployment

### Prerequisites

- Railway account
- GitHub repository

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Railway Project**
   - Connect your GitHub repository
   - Railway will automatically detect the `railway.toml` configuration

3. **Set Environment Variables**
   ```env
   DATABASE_URL=<railway-postgres-url>
   OPENAI_API_KEY=<your-openai-key>
   MEILI_MASTER_KEY=<generate-secure-key>
   MEILI_HOST=<railway-meilisearch-internal-url>
   NEXT_PUBLIC_MEILI_HOST=<railway-meilisearch-public-url>
   NEXT_PUBLIC_SITE_URL=<your-railway-app-url>
   VECTOR_DIM=1536
   NODE_ENV=production
   ```

4. **Deploy Services**
   - Railway will deploy both the web app and Meilisearch service
   - The database will be automatically provisioned

5. **Run Initial Setup**
   ```bash
   # SSH into your Railway deployment or use Railway CLI
   npm run migrate
   npm run seed
   ```

### Railway Configuration

The `railway.toml` file configures two services:

- **web**: Next.js application (port 8080)
- **meilisearch**: Search engine with persistent volume

## Database Schema

### Games
- Basic game information (title, manufacturer, year, etc.)
- Links to IPDB and Pinside

### Rulesets
- Version-specific rules for each game
- Provenance tracking

### Rule Sections
- Individual rule sections with vector embeddings
- Full-text search integration
- Structured metadata (facts)

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `POST /api/ask` - AI Q&A endpoint

### Admin Endpoints

- `POST /api/admin/games` - Create game
- `POST /api/admin/rulesets` - Create ruleset
- `POST /api/admin/process-markdown` - Parse markdown into sections
- `POST /api/admin/generate-embeddings` - Generate AI embeddings
- `POST /api/admin/reindex` - Reindex search content

## Usage Examples

### Adding a New Game

1. Visit `/admin`
2. Fill in game information
3. Paste rules in Markdown format
4. Submit - the system will:
   - Parse markdown into sections
   - Generate AI embeddings
   - Index for search

### Asking Questions

1. Visit a game page (e.g., `/games/[id]`)
2. Use the "Ask AI" component
3. Ask specific questions like:
   - "How do you start multiball?"
   - "What are the jackpot values?"
   - "How do you reach the wizard mode?"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/200even/pinball-rules-mvp/issues)
- Discussions: [Ask questions](https://github.com/200even/pinball-rules-mvp/discussions)