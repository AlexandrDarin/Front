import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import Button from '../../components/UI/Button';
import './PaymentSuccess.scss';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const orderId = searchParams.get('order_id');
        if (orderId) {
            loadOrder(orderId);
        }
    }, []);

    const loadOrder = async (orderId) => {
        try {
            const orderData = await api.getOrderById(orderId);
            setOrder(orderData);
        } catch (error) {
            console.error('Ошибка загрузки заказа:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-success-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="payment-success">
            <div className="success-card">
                <div className="success-icon">✅</div>
                <h1>Оплата прошла успешно!</h1>
                <p>Спасибо за покупку. Ваш заказ #{order?.id} оплачен и передан в обработку.</p>
                
                <div className="order-info">
                    <h3>Детали заказа</h3>
                    <p><strong>Номер заказа:</strong> {order?.id}</p>
                    <p><strong>Сумма:</strong> {order?.total_amount.toLocaleString()} ₽</p>
                    <p><strong>Статус:</strong> Оплачен</p>
                </div>

                <div className="success-actions">
                    <Button onClick={() => navigate('/orders')}>
                        История заказов
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Продолжить покупки
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;