-- CodeMaster AI: Test Users and Sample Data Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- PART 1: Create Test Users
-- ============================================

-- Create Instructor User
INSERT INTO users (email, full_name, role, is_active, xp_points, current_streak, bio, created_at)
VALUES (
    'instructor@codemaster.ai',
    'Dr. Sarah Johnson',
    'instructor',
    true,
    500,
    7,
    'Senior Software Engineer with 10+ years of experience teaching Python and Web Development',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create Support User
INSERT INTO users (email, full_name, role, is_active, xp_points, current_streak, bio, created_at)
VALUES (
    'support@codemaster.ai',
    'Alex Martinez',
    'support',
    true,
    100,
    3,
    'Customer Support Specialist dedicated to helping students succeed',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create Student User 1
INSERT INTO users (email, full_name, role, is_active, xp_points, current_streak, bio, created_at)
VALUES (
    'student1@example.com',
    'Emma Wilson',
    'student',
    true,
    250,
    5,
    'Aspiring software developer learning to code',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (email) DO NOTHING;

-- Create Student User 2
INSERT INTO users (email, full_name, role, is_active, xp_points, current_streak, bio, created_at)
VALUES (
    'student2@example.com',
    'Michael Chen',
    'student',
    true,
    180,
    2,
    'Computer Science student passionate about AI and machine learning',
    NOW() - INTERVAL '5 days'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PART 2: Create Sample Courses
-- ============================================

-- Get instructor ID for course assignment
DO $$
DECLARE
    instructor_id INT;
BEGIN
    SELECT id INTO instructor_id FROM users WHERE email = 'instructor@codemaster.ai';
    
    -- Course 1: Python Fundamentals
    INSERT INTO courses (title, description, slug, instructor_id, is_published, course_type)
    VALUES (
        'Python Fundamentals',
        'Master the basics of Python programming with hands-on exercises and real-world projects. Perfect for beginners!',
        'python-fundamentals',
        instructor_id,
        true,
        'pre_recorded'
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Course 2: Web Development with JavaScript
    INSERT INTO courses (title, description, slug, instructor_id, is_published, course_type)
    VALUES (
        'Web Development Bootcamp',
        'Learn modern web development with HTML, CSS, and JavaScript. Build responsive websites from scratch!',
        'web-development-bootcamp',
        instructor_id,
        true,
        'pre_recorded'
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Course 3: Data Structures & Algorithms
    INSERT INTO courses (title, description, slug, instructor_id, is_published, course_type)
    VALUES (
        'Data Structures & Algorithms',
        'Deep dive into essential data structures and algorithms. Prepare for technical interviews!',
        'data-structures-algorithms',
        instructor_id,
        false,
        'pre_recorded'
    ) ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================
-- PART 3: Add Lessons to Courses
-- ============================================

DO $$
DECLARE
    python_course_id INT;
    web_course_id INT;
BEGIN
    -- Get course IDs
    SELECT id INTO python_course_id FROM courses WHERE slug = 'python-fundamentals';
    SELECT id INTO web_course_id FROM courses WHERE slug = 'web-development-bootcamp';
    
    -- Python Course Lessons
    INSERT INTO lessons (course_id, title, content, order_index, video_url)
    VALUES 
        (python_course_id, 'Introduction to Python', 'Learn what Python is and why it''s one of the most popular programming languages in the world.', 1, 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
        (python_course_id, 'Variables and Data Types', 'Understand how to store and manipulate data using variables and different data types.', 2, 'https://www.youtube.com/watch?v=LrOAl8vUFHY'),
        (python_course_id, 'Control Flow', 'Master if statements, loops, and conditional logic to control program flow.', 3, 'https://www.youtube.com/watch?v=PqFKRqpHrjw'),
        (python_course_id, 'Functions', 'Learn to write reusable code with functions and understand scope.', 4, 'https://www.youtube.com/watch?v=NE97ylAnrz4'),
        (python_course_id, 'Lists and Dictionaries', 'Work with Python''s most important data structures.', 5, 'https://www.youtube.com/watch?v=W8KRzm-HUcc')
    ON CONFLICT DO NOTHING;
    
    -- Web Development Course Lessons
    INSERT INTO lessons (course_id, title, content, order_index, video_url)
    VALUES 
        (web_course_id, 'HTML Basics', 'Learn the structure of web pages with HTML elements and tags.', 1, 'https://www.youtube.com/watch?v=UB1O30fR-EE'),
        (web_course_id, 'CSS Styling', 'Make your websites beautiful with CSS styles and layouts.', 2, 'https://www.youtube.com/watch?v=1PnVor36_40'),
        (web_course_id, 'JavaScript Fundamentals', 'Add interactivity to your websites with JavaScript.', 3, 'https://www.youtube.com/watch?v=W6NZfCO5SIk'),
        (web_course_id, 'DOM Manipulation', 'Learn to dynamically modify web pages using the Document Object Model.', 4, 'https://www.youtube.com/watch?v=y17RuWkWdn8'),
        (web_course_id, 'Building Your First Website', 'Put it all together and build a complete responsive website.', 5, 'https://www.youtube.com/watch?v=hu-q2zYwEYs')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- PART 4: Create Coding Challenges
-- ============================================

DO $$
DECLARE
    lesson_id INT;
    challenge_id INT;
BEGIN
    -- Challenge 1: Hello World (Python Intro)
    SELECT id INTO lesson_id FROM lessons WHERE title = 'Introduction to Python' LIMIT 1;
    
    INSERT INTO challenges (lesson_id, slug, problem_statement, starter_code, test_cases)
    VALUES (
        lesson_id,
        'python-hello-world',
        'Write a function called `greet()` that prints "Hello, World!" to the console.',
        'def greet():\n    # Your code here\n    pass',
        '[{"input": "", "expected_output": "Hello, World!"}]'::json
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Challenge 2: Variables (Python Variables)
    SELECT id INTO lesson_id FROM lessons WHERE title = 'Variables and Data Types' LIMIT 1;
    
    INSERT INTO challenges (lesson_id, slug, problem_statement, starter_code, test_cases)
    VALUES (
        lesson_id,
        'python-variables',
        'Create a function `calculate_age(birth_year)` that returns the current age given a birth year. Assume current year is 2024.',
        'def calculate_age(birth_year):\n    # Your code here\n    pass',
        '[{"input": "2000", "expected_output": "24"}, {"input": "1990", "expected_output": "34"}]'::json
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Challenge 3: HTML Structure
    SELECT id INTO lesson_id FROM lessons WHERE title = 'HTML Basics' LIMIT 1;
    
    INSERT INTO challenges (lesson_id, slug, problem_statement, starter_code, test_cases)
    VALUES (
        lesson_id,
        'html-basic-page',
        'Create a basic HTML page with a title "My First Page" and a heading that says "Welcome to Web Development".',
        '<!DOCTYPE html>\n<html>\n<head>\n    <!-- Your code here -->\n</head>\n<body>\n    <!-- Your code here -->\n</body>\n</html>',
        '[{"input": "", "expected_output": "contains <title>My First Page</title> and <h1>Welcome to Web Development</h1>"}]'::json
    ) ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================
-- PART 5: Create Sample Enrollments
-- ============================================

DO $$
DECLARE
    student1_id INT;
    student2_id INT;
    python_course_id INT;
    web_course_id INT;
BEGIN
    -- Get user and course IDs
    SELECT id INTO student1_id FROM users WHERE email = 'student1@example.com';
    SELECT id INTO student2_id FROM users WHERE email = 'student2@example.com';
    SELECT id INTO python_course_id FROM courses WHERE slug = 'python-fundamentals';
    SELECT id INTO web_course_id FROM courses WHERE slug = 'web-development-bootcamp';
    
    -- Enroll students
    INSERT INTO enrollments (user_id, course_id, enrolled_at)
    VALUES 
        (student1_id, python_course_id, NOW() - INTERVAL '2 days'),
        (student1_id, web_course_id, NOW() - INTERVAL '1 day'),
        (student2_id, python_course_id, NOW() - INTERVAL '3 days')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- PART 6: Create Sample Submissions
-- ============================================

DO $$
DECLARE
    student1_id INT;
    challenge_id INT;
BEGIN
    SELECT id INTO student1_id FROM users WHERE email = 'student1@example.com';
    SELECT id INTO challenge_id FROM challenges WHERE slug = 'python-hello-world' LIMIT 1;
    
    -- Successful submission
    INSERT INTO submissions (user_id, challenge_id, code_submitted, status, passed_test_cases, total_test_cases, stdout, submitted_at)
    VALUES (
        student1_id,
        challenge_id,
        'def greet():\n    print("Hello, World!")',
        'Passed',
        1,
        1,
        'Hello, World!',
        NOW() - INTERVAL '1 day'
    );
    
    -- Failed submission
    SELECT id INTO challenge_id FROM challenges WHERE slug = 'python-variables' LIMIT 1;
    
    INSERT INTO submissions (user_id, challenge_id, code_submitted, status, passed_test_cases, total_test_cases, stderr, submitted_at)
    VALUES (
        student1_id,
        challenge_id,
        'def calculate_age(birth_year):\n    return 2024 - birth_year + 1',
        'Failed',
        0,
        2,
        'Expected 24, got 25',
        NOW() - INTERVAL '6 hours'
    );
END $$;

-- ============================================
-- Verification Queries
-- ============================================

-- Check created users
SELECT id, email, full_name, role FROM users WHERE email LIKE '%codemaster.ai%' OR email LIKE '%example.com%';

-- Check created courses
SELECT c.id, c.title, c.slug, u.full_name as instructor, c.is_published 
FROM courses c 
JOIN users u ON c.instructor_id = u.id;

-- Check lessons count per course
SELECT c.title, COUNT(l.id) as lesson_count
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
GROUP BY c.id, c.title;

-- Check challenges
SELECT l.title as lesson, c.slug as challenge_slug
FROM challenges c
JOIN lessons l ON c.lesson_id = l.id;

-- Check enrollments
SELECT u.full_name as student, c.title as course
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id;
