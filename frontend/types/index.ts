export interface User {
    id: number;
    email: string;
    full_name?: string;
    role: string; // 'student' | 'instructor' | 'admin' | 'support'
    avatar_url?: string;
    bio?: string;
    is_active: boolean;
    current_streak: number;
    xp_points: number;
    is_pro: boolean;
    created_at: string;
}

export interface Course {
    id: number;
    title: string;
    description?: string;
    slug: string;
    thumbnail_url?: string;
    is_published: boolean;
    course_type: string; // 'pre_recorded' | 'live_cohort' | 'one_on_one'
    instructor_id?: number;
    lessons?: Lesson[];
}

export interface Lesson {
    id: number;
    course_id: number;
    title: string;
    video_url?: string;
    content?: string;
    order_index: number;
    challenge?: Challenge;
}

export interface Challenge {
    id: number;
    lesson_id: number;
    slug: string;
    problem_statement: string;
    starter_code?: string;
    test_cases?: TestCase[];
}

export interface TestCase {
    input: string;
    expected_output: string;
}

export interface Submission {
    id: number;
    user_id: number;
    challenge_id: number;
    code_submitted: string;
    status: string; // 'Passed' | 'Failed' | 'Error'
    passed_test_cases: number;
    total_test_cases: number;
    submitted_at: string;
}

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    enrolled_at: string;
    course?: Course;
    progress: LessonProgress[];
}

export interface LessonProgress {
    lesson_id: number;
    is_completed: boolean;
    completed_at?: string;
}

export interface Comment {
    id: number;
    user_id: number;
    lesson_id: number;
    content: string;
    created_at: string;
    parent_id?: number;
    user?: User;
    replies?: Comment[];
}
