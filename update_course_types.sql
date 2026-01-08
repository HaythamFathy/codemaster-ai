-- 1. Create CourseType Enum
CREATE TYPE "CourseType" AS ENUM ('one_on_one', 'group', 'pre_recorded');

-- 2. Add course_type to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type "CourseType" DEFAULT 'pre_recorded';
