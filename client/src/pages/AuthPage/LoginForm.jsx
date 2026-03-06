import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import './AuthPage.scss';

const LoginForm = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Очищаем ошибку при вводе
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Неверный формат email';
        }
        
        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setErrors({ form: result.error });
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form__title">Вход в аккаунт</h2>
            
            {errors.form && (
                <div className="auth-form__error">{errors.form}</div>
            )}
            
            <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="your@email.com"
            />
            
            <Input
                label="Пароль"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="••••••••"
            />
            
            <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading}
            >
                {loading ? 'Вход...' : 'Войти'}
            </Button>
            
            <div className="auth-form__switch">
                Нет аккаунта?{' '}
                <button 
                    type="button"
                    className="auth-form__switch-link"
                    onClick={onSwitchToRegister}
                >
                    Зарегистрироваться
                </button>
            </div>
        </form>
    );
};

export default LoginForm;