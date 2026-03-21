import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button';
import './OrdersPage.scss';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      paid: 'status-paid',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <div className="empty-icon">📦</div>
        <h2>У вас пока нет заказов</h2>
        <p>Перейдите в каталог и выберите товары</p>
        <Link to="/">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Мои заказы</h1>
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
              <div className={`order-status ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>
            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.product_image || 'https://via.placeholder.com/60'} alt={item.product_title} />
                  <div className="item-details">
                    <h4>{item.product_title}</h4>
                    <div className="item-price">
                      {item.price_at_time?.toLocaleString()} ₽ × {item.quantity}
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
                <strong>{order.total_amount?.toLocaleString()} ₽</strong>
              </div>
              <div className="order-address">
                <span>Адрес доставки:</span>
                <p>{order.shipping_address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;