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

// Enrollment API
export const enrollInCourse = (courseId: number) => api.post('/enrollments/', { course_id: courseId });
export const getMyEnrollments = () => api.get('/enrollments/me');
export const checkEnrollmentStatus = (courseId: number) => api.get(`/enrollments/${courseId}/status`);

export default api;
