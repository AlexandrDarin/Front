import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Переменная для хранения состояния обновления токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Интерцептор для добавления access токена
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
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
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url === '/auth/refresh') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            isRefreshing = false;
            return Promise.reject(error);
        }

        try {
            const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            
            const { accessToken, refreshToken: newRefreshToken, user } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            processQueue(null, accessToken);
            
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
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
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    refresh: async (refreshToken) => {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // ========== Пользователи (только админ) ==========
    getUsers: async () => {
        const response = await apiClient.get('/users');
        return response.data;
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
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

    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    // ========== Товары (продавец и админ) ==========
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
    },

    // ========== Заказы ==========
    getOrders: async (limit = 10, offset = 0) => {
        const response = await apiClient.get(`/orders?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (orderData) => {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    },

    // ========== Платежи ==========
    createPayment: async (orderId, returnUrl) => {
        const response = await apiClient.post('/payments/create', { order_id: orderId, return_url: returnUrl });
        return response.data;
    },

    getPaymentStatus: async (paymentId) => {
        const response = await apiClient.get(`/payments/${paymentId}`);
        return response.data;
    }
};

export default api;