import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Используем useCallback для мемоизации функции
    const loadUser = useCallback(async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            logout();
        }
    }, []);

    useEffect(() => {
        // Загружаем пользователя из localStorage при старте
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Если есть токен, проверяем его валидность
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
            loadUser();
        }
    }, [user, loadUser]); // Добавлены зависимости

    const login = async (email, password) => {
        try {
            const response = await api.login(email, password);
            setUser(response.user);
            return { success: true, data: response };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Ошибка входа' 
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.register(userData);
            // После регистрации сразу входим
            return await login(userData.email, userData.password);
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Ошибка регистрации' 
            };
        }
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller' || user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};