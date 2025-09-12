-- Create UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    manufacturer TEXT,
    year INTEGER,
    system TEXT,
    ipdb_id INTEGER UNIQUE,
    pinside_id INTEGER UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rulesets table
CREATE TABLE rulesets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    rom_version TEXT,
    provenance JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rule sections table
CREATE TABLE rule_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruleset_id UUID NOT NULL REFERENCES rulesets(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    facts JSONB DEFAULT '{}',
    order_idx INTEGER DEFAULT 0,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_games_title ON games USING GIN (to_tsvector('english', title));
CREATE INDEX idx_games_manufacturer ON games (manufacturer);
CREATE INDEX idx_games_year ON games (year);
CREATE INDEX idx_games_ipdb_id ON games (ipdb_id);
CREATE INDEX idx_games_pinside_id ON games (pinside_id);

CREATE INDEX idx_rulesets_game_id ON rulesets (game_id);
CREATE INDEX idx_rulesets_rom_version ON rulesets (rom_version);

CREATE INDEX idx_rule_sections_ruleset_id ON rule_sections (ruleset_id);
CREATE INDEX idx_rule_sections_section_type ON rule_sections (section_type);
CREATE INDEX idx_rule_sections_facts ON rule_sections USING GIN (facts);
CREATE INDEX idx_rule_sections_order ON rule_sections (order_idx);

-- Create IVFFLAT index for vector similarity search (cosine distance)
CREATE INDEX idx_rule_sections_embedding ON rule_sections 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rulesets_updated_at BEFORE UPDATE ON rulesets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rule_sections_updated_at BEFORE UPDATE ON rule_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
