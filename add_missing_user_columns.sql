-- Comprehensive migration to add all potentially missing columns to users table
-- Run this in Supabase SQL Editor

-- Add is_pro column (for premium users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- Add stripe_customer_id column (for payment integration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add bio column (for user profile)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add xp_points column (for gamification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

-- Add current_streak column (for gamification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Add google_sub column (for Google OAuth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;

-- Add avatar_url column (for user profile picture)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
