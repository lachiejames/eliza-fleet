-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create base tables (if they don't exist)
CREATE TABLE IF NOT EXISTS accounts (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "username" TEXT UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "avatarUrl" TEXT,
    "details" JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rooms (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memories (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" JSONB NOT NULL,
    "embedding" vector(1536),
    "userId" UUID REFERENCES accounts("id"),
    "agentId" UUID REFERENCES accounts("id"),
    "roomId" UUID REFERENCES rooms("id"),
    "isUnique" BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS participants (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES accounts("id"),
    "roomId" UUID REFERENCES rooms("id"),
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create logs table for audit logging
CREATE TABLE IF NOT EXISTS logs (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL REFERENCES accounts("id"),
    "body" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "roomId" UUID NOT NULL REFERENCES rooms("id")
);

-- Create cache table
CREATE TABLE IF NOT EXISTS cache (
    "key" TEXT NOT NULL,
    "agentId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("key", "agentId")
);

-- Set up indexes
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories
    USING hnsw ("embedding" vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_memories_type_room ON memories("type", "roomId");

CREATE INDEX IF NOT EXISTS idx_participants_user ON participants("userId");
CREATE INDEX IF NOT EXISTS idx_participants_room ON participants("roomId");

-- Set up Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memories_isolation" ON memories;
CREATE POLICY "memories_isolation" ON memories
    USING (auth.uid() = "userId" OR auth.uid() = "agentId");

-- Create application role and permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;
END
$$;

GRANT SELECT, INSERT ON memories TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Insert default data (if it doesn't exist)
INSERT INTO public.accounts (id, name, email, "avatarUrl", details)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Default Agent',
    'default@agent.com',
    '',
    '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rooms (id)
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (id, "userId", "roomId")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- Analyze tables for query optimization
ANALYZE accounts;
ANALYZE rooms;
ANALYZE memories;
ANALYZE participants;
ANALYZE logs;
ANALYZE cache;

-- Regular vacuum (optional, can be scheduled separately)
VACUUM ANALYZE memories;

-- Reindex vector similarity index (optional, can be scheduled separately)
REINDEX INDEX idx_memories_embedding;
