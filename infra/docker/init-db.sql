-- BuildEstate PostgreSQL initialization
-- Runs once on first container start

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- For GIN index support
-- CREATE EXTENSION IF NOT EXISTS "postgis";     -- For geo queries (optional)

-- Set timezone
SET timezone = 'Asia/Kolkata';
