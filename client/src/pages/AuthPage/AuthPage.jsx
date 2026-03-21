import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.scss';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register({ email, password, first_name: name });
    }

    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-form">
            <h2>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ width: '100%', marginBottom: '20px', padding: '10px' }}
                required
              />
              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#4361ee', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <div className="auth-switch">
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer' }}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
