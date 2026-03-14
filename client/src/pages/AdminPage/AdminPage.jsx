import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import Button from '../../components/UI/Button';
import './AdminPage.scss';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const { hasRole } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId, userData) => {
        try {
            const updated = await api.updateUser(userId, userData);
            setUsers(users.map(u => u.id === userId ? updated : u));
            setEditingUser(null);
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
        }
    };

    const handleToggleBlock = async (userId, currentStatus) => {
        if (!window.confirm(`Вы уверены, что хотите ${currentStatus ? 'заблокировать' : 'разблокировать'} пользователя?`)) {
            return;
        }
        try {
            await api.updateUser(userId, { isActive: !currentStatus });
            loadUsers();
        } catch (error) {
            console.error('Ошибка блокировки пользователя:', error);
        }
    };

    if (!hasRole('admin')) {
        return (
            <div className="container">
                <div className="access-denied">
                    <h2>Доступ запрещен</h2>
                    <p>Эта страница доступна только администраторам</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <h1 className="admin-title">Управление пользователями</h1>

                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : (
                    <div className="users-table">
                        <div className="table-header">
                            <div>ID</div>
                            <div>Email</div>
                            <div>Имя</div>
                            <div>Фамилия</div>
                            <div>Роль</div>
                            <div>Статус</div>
                            <div>Действия</div>
                        </div>

                        {users.map(user => (
                            <div key={user.id} className="table-row">
                                {editingUser?.id === user.id ? (
                                    <>
                                        <div>{user.id}</div>
                                        <div>{user.email}</div>
                                        <div>
                                            <input
                                                type="text"
                                                value={editingUser.first_name}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    first_name: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={editingUser.last_name}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    last_name: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={editingUser.role}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    role: e.target.value
                                                })}
                                            >
                                                <option value="user">Пользователь</option>
                                                <option value="seller">Продавец</option>
                                                <option value="admin">Администратор</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span className={`status ${user.isActive ? 'active' : 'blocked'}`}>
                                                {user.isActive ? 'Активен' : 'Заблокирован'}
                                            </span>
                                        </div>
                                        <div className="actions">
                                            <Button
                                                size="small"
                                                onClick={() => handleUpdateUser(user.id, editingUser)}
                                            >
                                                Сохранить
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => setEditingUser(null)}
                                            >
                                                Отмена
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="user-id">{user.id}</div>
                                        <div>{user.email}</div>
                                        <div>{user.first_name}</div>
                                        <div>{user.last_name}</div>
                                        <div>
                                            <span className={`role role-${user.role}`}>
                                                {user.role === 'admin' && 'Админ'}
                                                {user.role === 'seller' && 'Продавец'}
                                                {user.role === 'user' && 'Пользователь'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`status ${user.isActive ? 'active' : 'blocked'}`}>
                                                {user.isActive ? 'Активен' : 'Заблокирован'}
                                            </span>
                                        </div>
                                        <div className="actions">
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                Редактировать
                                            </Button>
                                            <Button
                                                size="small"
                                                variant={user.isActive ? 'danger' : 'primary'}
                                                onClick={() => handleToggleBlock(user.id, user.isActive)}
                                            >
                                                {user.isActive ? 'Заблокировать' : 'Разблокировать'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;