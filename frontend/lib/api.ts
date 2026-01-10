import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api'),
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip Ngrok warning page
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const getLessonTask = (lessonId: string) => api.get(`/api/lessons/${lessonId}/task`);

export const submitCode = (data: { code_submitted: string; lesson_id: number }) => api.post('/submissions/submit_code', data);

export const updateProfile = (data: { full_name?: string; avatar_url?: string; bio?: string }) => api.put('/users/me', data);

// Enrollment API
export const enrollInCourse = (courseId: number) => api.post('/enrollments', { course_id: courseId });
export const getMyEnrollments = () => api.get('/enrollments/me');
export const checkEnrollmentStatus = (courseId: number) => api.get(`/enrollments/${courseId}/status`);

// CMS API (Lessons & Challenges)
export const getLessons = (courseId: number) => api.get(`/lessons/${courseId}`);
export const createLesson = (data: any) => api.post('/lessons/', data);
export const updateLesson = (lessonId: number, data: any) => api.put(`/lessons/${lessonId}`, data);
export const deleteLesson = (lessonId: number) => api.delete(`/lessons/${lessonId}`);

export const getChallenge = (lessonId: number) => api.get(`/lessons/${lessonId}/challenge`);
export const updateChallenge = (lessonId: number, data: any) => api.post(`/lessons/${lessonId}/challenge`, data);

export const getLeaderboard = () => api.get('/users/leaderboard');

export const createCheckoutSession = () => api.post('/payments/create-checkout-session');

// Comments API
export const getComments = (lessonId: number) => api.get(`/comments/lesson/${lessonId}`);
export const postComment = (data: { lesson_id: number; content: string; parent_id?: number }) => api.post('/comments/', data);

export default api;
