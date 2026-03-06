import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button';
import './ProfilePage.scss';

const ProfilePage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="profile-page">
            <div className="container">
                <h1 className="profile-title">Личный кабинет</h1>
                
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="profile-info">
                            <h2>{user?.first_name} {user?.last_name}</h2>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                    
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Заказов</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">В избранном</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Отзывов</span>
                        </div>
                    </div>
                    
                    <div className="profile-actions">
                        <Button variant="outline" onClick={logout}>
                            Выйти из аккаунта
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;