/**
 * API Service - Handles all API calls to the Flask backend
 */
import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// News endpoints
export const newsAPI = {
    getAll: (params) => api.get('/news', { params }),
    getOne: (id) => api.get(`/news/${id}`),
    create: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/news', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`),
};

// Admin endpoints
export const adminAPI = {
    getPending: () => api.get('/admin/pending'),
    verify: (id) => api.post(`/admin/verify/${id}`),
    reject: (id) => api.post(`/admin/reject/${id}`),
    getStats: () => api.get('/admin/stats'),
};

// Utility endpoints
export const utilsAPI = {
    getDistricts: () => api.get('/districts'),
    getCategories: () => api.get('/categories'),
};

export default api;
