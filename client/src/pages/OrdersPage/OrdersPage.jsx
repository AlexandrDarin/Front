import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Button from '../../components/UI/Button';
import './OrdersPage.scss';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await api.getOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает оплаты',
            'paid': 'Оплачен',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменён'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        return `order-status status-${status}`;
    };

    if (loading) {
        return <div className="loading">Загрузка заказов...</div>;
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="orders-title">История заказов</h1>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <h2>У вас пока нет заказов</h2>
                        <p>Перейдите в каталог и выберите товары</p>
                        <Button onClick={() => navigate('/')}>
                            Перейти в каталог
                        </Button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-number">Заказ #{order.id}</span>
                                        <span className="order-date">
                                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                    <div className={getStatusClass(order.status)}>
                                        {getStatusText(order.status)}
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.OrderItems?.map(item => (
                                        <div key={item.id} className="order-item">
                                            <img 
                                                src={item.product_image} 
                                                alt={item.product_title}
                                                onClick={() => navigate(`/product/${item.product_id}`)}
                                            />
                                            <div className="item-details">
                                                <h4 onClick={() => navigate(`/product/${item.product_id}`)}>
                                                    {item.product_title}
                                                </h4>
                                                <div className="item-price">
                                                    {item.price_at_time.toLocaleString()} ₽ × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="item-total">
                                                {(item.price_at_time * item.quantity).toLocaleString()} ₽
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Итого:</span>
                                        <strong>{order.total_amount.toLocaleString()} ₽</strong>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="small"
                                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                    >
                                        {selectedOrder === order.id ? 'Скрыть детали' : 'Подробнее'}
                                    </Button>
                                </div>

                                {selectedOrder === order.id && (
                                    <div className="order-details">
                                        <h4>Детали доставки</h4>
                                        <p><strong>Адрес:</strong> {order.shipping_address}</p>
                                        <p><strong>Способ оплаты:</strong> {order.payment_method}</p>
                                        {order.payment_id && (
                                            <p><strong>ID платежа:</strong> {order.payment_id}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;