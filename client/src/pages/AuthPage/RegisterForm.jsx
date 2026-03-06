import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import './AuthPage.scss';

const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        
        if (!formData.first_name) {
            newErrors.first_name = 'Имя обязательно';
        }
        
        if (!formData.last_name) {
            newErrors.last_name = 'Фамилия обязательна';
        }
        
        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть минимум 6 символов';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
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
        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setErrors({ form: result.error });
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form__title">Регистрация</h2>
            
            {errors.form && (
                <div className="auth-form__error">{errors.form}</div>
            )}
            
            <div className="auth-form__row">
                <Input
                    label="Имя"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    required
                    placeholder="Иван"
                />
                
                <Input
                    label="Фамилия"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    required
                    placeholder="Петров"
                />
            </div>
            
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
            
            <Input
                label="Подтверждение пароля"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="••••••••"
            />
            
            <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading}
            >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            
            <div className="auth-form__switch">
                Уже есть аккаунт?{' '}
                <button 
                    type="button"
                    className="auth-form__switch-link"
                    onClick={onSwitchToLogin}
                >
                    Войти
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;