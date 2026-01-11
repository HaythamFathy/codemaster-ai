-- Clean up existing test data and re-insert with proper timestamps
-- Run this in Supabase SQL Editor to fix the 500 errors

-- Delete existing test data (keeps your real users)
DELETE FROM submissions WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%example.com%' OR email LIKE '%codemaster.ai%'
);

DELETE FROM enrollments WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%example.com%' OR email LIKE '%codemaster.ai%'
);

DELETE FROM users WHERE email LIKE '%example.com%' OR email LIKE '%codemaster.ai%';

-- Now run setup_test_data.sql again to re-create with proper timestamps
