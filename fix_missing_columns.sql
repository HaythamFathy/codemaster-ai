-- 1. Create CourseType Enum (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CourseType') THEN
        CREATE TYPE "CourseType" AS ENUM ('one_on_one', 'group', 'pre_recorded');
    END IF;
END$$;

-- 2. Add instructor_id column (if it doesn't exist)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 3. Add course_type column (if it doesn't exist)
-- Note: using "CourseType" enum in database, even if Python generic treats it as String for safety.
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_type "CourseType" DEFAULT 'pre_recorded';

-- 4. Verify columns exist (Diagnostic)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses';
