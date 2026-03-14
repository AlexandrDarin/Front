import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.scss';

const Header = () => {
    const { user, isAuthenticated, logout, hasRole } = useAuth(); // Добавлены isAuthenticated и hasRole
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <header className="header">
            <div className="header__inner">
                <Link to="/" className="brand">
                    <span className="brand__icon">⚡</span>
                    <span className="brand__text">TechStore</span>
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav__link">Каталог</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/profile" className="nav__link">Профиль</Link>
                            {hasRole('admin') && (
                                <Link to="/admin" className="nav__link">Админ панель</Link>
                            )}
                        </>
                    )}
                </nav>

                <div className="header__actions">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <span className="user-name">
                                {user?.first_name} {user?.last_name}
                            </span>
                            <button className="cart-btn" onClick={() => navigate('/cart')}>
                                🛒
                            </button>
                            <button className="logout-btn" onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="btn btn--outline"
                                onClick={() => navigate('/login')}
                            >
                                Вход
                            </button>
                            <button 
                                className="btn btn--primary"
                                onClick={() => navigate('/register')}
                            >
                                Регистрация
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;