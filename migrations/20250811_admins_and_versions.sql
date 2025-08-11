BEGIN;

-- Create admins table for separate admin authentication
CREATE TABLE IF NOT EXISTS admins (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NULL,
  totp_secret text NULL,
  active boolean NOT NULL DEFAULT true
);

-- Add optimistic locking to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 0;

-- Create separate session tables for customers and admins
-- First check if session table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'session') THEN
    -- Create customer session table as copy of existing session table
    CREATE TABLE IF NOT EXISTS session_customers (LIKE session INCLUDING ALL);
    -- Create admin session table as copy of existing session table  
    CREATE TABLE IF NOT EXISTS session_admins (LIKE session INCLUDING ALL);
  ELSE
    -- Create session tables from scratch
    CREATE TABLE IF NOT EXISTS session_customers (
      sid text PRIMARY KEY,
      sess json NOT NULL,
      expire timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS session_customers_expire_idx ON session_customers(expire);
    
    CREATE TABLE IF NOT EXISTS session_admins (
      sid text PRIMARY KEY,
      sess json NOT NULL,
      expire timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS session_admins_expire_idx ON session_admins(expire);
  END IF;
END $$;

-- Migrate existing admin users to new admins table if desired
-- This is commented out by default for safety - uncomment if you want to migrate existing admins
-- INSERT INTO admins (email, password_hash, created_at, active)
-- SELECT email, password, created_at::timestamptz, is_active
-- FROM users 
-- WHERE role = 'admin'
-- ON CONFLICT (email) DO NOTHING;

COMMIT;