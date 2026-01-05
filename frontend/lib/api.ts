import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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

export const submitCode = (data: { code_content: string; lesson_id: number }) => api.post('/submissions/submit_code', data);

export default api;
