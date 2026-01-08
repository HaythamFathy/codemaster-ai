-- 1. Update UserRole Enum (PostgreSQL requires separate command for enum modification)
-- Note: 'admin' and 'student' already exist.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'instructor';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'support';

-- 2. Add instructor_id to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id INTEGER;

-- 3. Add Foreign Key Constraint
ALTER TABLE courses 
ADD CONSTRAINT fk_courses_instructor 
FOREIGN KEY (instructor_id) 
REFERENCES users(id) 
ON DELETE SET NULL;
