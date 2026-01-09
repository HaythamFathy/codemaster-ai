-- 1. Drop the column first (if it exists) so we can drop the type
ALTER TABLE courses DROP COLUMN IF EXISTS course_type;

-- 2. Drop the Type completely (to clear any bad/old definitions)
DROP TYPE IF EXISTS "CourseType";

-- 3. Re-create the Type with the exact values we need
CREATE TYPE "CourseType" AS ENUM ('one_on_one', 'group', 'pre_recorded');

-- 4. Add the column back
ALTER TABLE courses 
ADD COLUMN course_type "CourseType" DEFAULT 'pre_recorded';

-- 5. (Just to be safe) Ensure instructor_id exists
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
