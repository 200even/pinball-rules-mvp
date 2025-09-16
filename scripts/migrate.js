const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'pinball_rules',
    user: 'postgres',
    password: 'password',
  });

  try {
    console.log('🚀 Running database migrations...\n');

    const migrationsDir = path.join(__dirname, '../db/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`📝 Running migration: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        await pool.query(sql);
        console.log(`✅ Completed: ${file}`);
      }
    }

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}
