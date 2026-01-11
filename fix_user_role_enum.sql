-- Fix: Update user_role enum to include all roles
-- Run this FIRST before running setup_test_data.sql

-- Check current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder;

-- Add missing enum values if they don't exist
DO $$
BEGIN
    -- Add 'instructor' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'instructor' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'instructor';
    END IF;
    
    -- Add 'support' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'support';
    END IF;
END$$;

-- Verify the enum now has all values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder;
