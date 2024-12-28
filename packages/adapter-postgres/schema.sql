-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- OPTIONAL: Drop existing tables and extensions (uncomment if needed)
-- DROP EXTENSION IF EXISTS vector CASCADE;
-- DROP TABLE IF EXISTS relationships CASCADE;
-- DROP TABLE IF EXISTS participants CASCADE;
-- DROP TABLE IF EXISTS logs CASCADE;
-- DROP TABLE IF EXISTS goals CASCADE;
-- DROP TABLE IF EXISTS memories CASCADE;
-- DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS accounts CASCADE;

--------------------------------------------------------------------------------
-- Create a function to determine vector dimension
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_embedding_dimension()
RETURNS INTEGER AS $$
BEGIN
    -- Check for OpenAI first
    IF current_setting('app.use_openai_embedding', TRUE) = 'true' THEN
        RETURN 1536;  -- OpenAI dimension
    -- Then check for Ollama
    ELSIF current_setting('app.use_ollama_embedding', TRUE) = 'true' THEN
        RETURN 1024;  -- Ollama mxbai-embed-large dimension
    ELSE
        RETURN 384;   -- BGE/Other embedding dimension
    END IF;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- Begin creating tables and indexes
--------------------------------------------------------------------------------
BEGIN;

--------------------------------------------------------------------------------
-- accounts
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name"      TEXT,
    "username"  TEXT UNIQUE,
    "email"     TEXT NOT NULL UNIQUE,
    "avatarUrl" TEXT,
    "details"   JSONB DEFAULT '{}'::jsonb
);

--------------------------------------------------------------------------------
-- rooms
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- memories
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type"      TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content"   JSONB NOT NULL,
    "embedding" vector(get_embedding_dimension()),  -- Dynamic vector size
    "userId"    UUID REFERENCES accounts("id"),
    "agentId"   UUID REFERENCES accounts("id"),
    "roomId"    UUID REFERENCES rooms("id"),
    "isUnique"  BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT fk_room  FOREIGN KEY ("roomId")  REFERENCES rooms("id")    ON DELETE CASCADE,
    CONSTRAINT fk_user  FOREIGN KEY ("userId")  REFERENCES accounts("id") ON DELETE CASCADE,
    CONSTRAINT fk_agent FOREIGN KEY ("agentId") REFERENCES accounts("id") ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- goals
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals (
    "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"       UUID REFERENCES accounts("id"),
    "name"         TEXT,
    "status"       TEXT,
    "description"  TEXT,
    "roomId"       UUID REFERENCES rooms("id"),
    "objectives"   JSONB DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT fk_room FOREIGN KEY ("roomId") REFERENCES rooms("id") ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES accounts("id") ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- logs
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"    UUID NOT NULL REFERENCES accounts("id"),
    "body"      JSONB NOT NULL,
    "type"      TEXT NOT NULL,
    "roomId"    UUID NOT NULL REFERENCES rooms("id"),
    CONSTRAINT fk_room FOREIGN KEY ("roomId") REFERENCES rooms("id") ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES accounts("id") ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- participants
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS participants (
    "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"            UUID REFERENCES accounts("id"),
    "roomId"            UUID REFERENCES rooms("id"),
    "userState"         TEXT,
    "last_message_read" TEXT,
    UNIQUE("userId", "roomId"),
    CONSTRAINT fk_room FOREIGN KEY ("roomId") REFERENCES rooms("id") ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES accounts("id") ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- relationships
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relationships (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userA"     UUID NOT NULL REFERENCES accounts("id"),
    "userB"     UUID NOT NULL REFERENCES accounts("id"),
    "status"    TEXT,
    "userId"    UUID NOT NULL REFERENCES accounts("id"),
    CONSTRAINT fk_user_a FOREIGN KEY ("userA") REFERENCES accounts("id") ON DELETE CASCADE,
    CONSTRAINT fk_user_b FOREIGN KEY ("userB") REFERENCES accounts("id") ON DELETE CASCADE,
    CONSTRAINT fk_user   FOREIGN KEY ("userId") REFERENCES accounts("id") ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- cache
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cache (
    "key"       TEXT NOT NULL,
    "agentId"   TEXT NOT NULL,
    "value"     JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP,
    PRIMARY KEY ("key", "agentId")
);

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_memories_embedding
    ON memories USING hnsw ("embedding" vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_memories_type_room
    ON memories("type", "roomId");

CREATE INDEX IF NOT EXISTS idx_participants_user
    ON participants("userId");

CREATE INDEX IF NOT EXISTS idx_participants_room
    ON participants("roomId");

CREATE INDEX IF NOT EXISTS idx_relationships_users
    ON relationships("userA", "userB");

COMMIT;
