# Local Development Setup

## Quick Start (Recommended)

### Option 1: Using Docker (Easiest)

1. **Install Docker Desktop**
   - Download from: https://docs.docker.com/desktop/install/mac-install/
   - Install and start Docker Desktop

2. **Run the setup script**
   ```bash
   ./setup-local.sh
   ```

3. **Add your OpenAI API key**
   - Edit `.env.local`
   - Replace `sk-your-openai-api-key-here` with your actual OpenAI API key
   - Get one at: https://platform.openai.com/api-keys

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Visit the application**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

### Option 2: Manual Setup (Without Docker)

If you prefer not to use Docker, you'll need to install PostgreSQL and Meilisearch manually:

#### Install PostgreSQL with pgvector

**Using Homebrew:**
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Install pgvector extension
brew install pgvector

# Create database
createdb pinball_rules

# Enable pgvector extension
psql pinball_rules -c "CREATE EXTENSION vector;"
```

#### Install Meilisearch

**Using Homebrew:**
```bash
# Install Meilisearch
brew install meilisearch

# Start Meilisearch with master key
MEILI_MASTER_KEY=your-secure-master-key-here meilisearch
```

**Or download binary:**
```bash
# Download and run Meilisearch
curl -L https://install.meilisearch.com | sh
MEILI_MASTER_KEY=your-secure-master-key-here ./meilisearch
```

#### Update Environment Variables

Edit `.env.local`:
```env
DATABASE_URL="postgresql://your-username@localhost:5432/pinball_rules"
OPENAI_API_KEY="sk-your-actual-openai-api-key"
MEILI_MASTER_KEY="your-secure-master-key-here"
MEILI_HOST="http://localhost:7700"
NEXT_PUBLIC_MEILI_HOST="http://localhost:7700"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
VECTOR_DIM=1536
NODE_ENV="development"
```

#### Run Setup Commands

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database (requires OpenAI API key)
npm run seed

# Start development server
npm run dev
```

## Testing Without OpenAI API Key

If you don't have an OpenAI API key yet, you can still test the basic functionality:

1. **Skip the seeding step** (it requires OpenAI for embeddings)
2. **Use the admin panel** to add games manually (without AI features)
3. **Test the basic browsing functionality**

The AI Q&A features won't work without a valid OpenAI API key, but you can still:
- Browse the games list
- View game details
- Use the admin panel to add games
- Test the search functionality (keyword-only)

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL if needed
brew services restart postgresql@16
```

### Meilisearch Issues
```bash
# Check if Meilisearch is running
curl http://localhost:7700/health

# Restart Meilisearch
pkill meilisearch
MEILI_MASTER_KEY=your-secure-master-key-here meilisearch
```

### Migration Errors
```bash
# Check database connection
psql pinball_rules -c "SELECT version();"

# Re-run migrations
npm run migrate
```

### Seeding Errors
- Usually caused by missing/invalid OpenAI API key
- Make sure your OpenAI API key is valid and has sufficient credits
- Check the console for specific error messages

## Development Workflow

1. **Start services** (PostgreSQL + Meilisearch)
2. **Run migrations** (if schema changes)
3. **Start dev server**: `npm run dev`
4. **Make changes** to code
5. **Test changes** at http://localhost:3000
6. **Reindex search** if needed: `npm run reindex`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed with sample data
- `npm run reindex` - Reindex Meilisearch

## Services URLs

- **Next.js App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Meilisearch**: http://localhost:7700
- **Meilisearch Dashboard**: http://localhost:7700 (when running)
