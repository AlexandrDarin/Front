import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.scss';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            TechStore
          </Link>
          
          <nav className="nav">
            <Link to="/products">Каталог</Link>
          </nav>
          
          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              🛒
            </Link>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-name">{user?.first_name || user?.email}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/auth" className="auth-link">Войти</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
