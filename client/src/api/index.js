import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Интерцептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Токен истек или недействителен
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const api = {
    // ========== Аутентификация ==========
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // ========== Товары (публичные) ==========
    getProducts: async (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.inStock) params.append('inStock', 'true');
        
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        
        const response = await apiClient.get(url);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data;
    },

    // ========== Товары (защищенные - требуют токен) ==========
    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (product) => {
        const response = await apiClient.post('/products', product);
        return response.data;
    },

    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    }
};

export default api;