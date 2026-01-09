-- Add xp_points column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;
