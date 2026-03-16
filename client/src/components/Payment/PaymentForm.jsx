import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import Button from '../UI/Button';
import './PaymentForm.scss';

const PaymentForm = ({ order, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handlePayment = async () => {
        setLoading(true);
        try {
            const returnUrl = `${window.location.origin}/payment/success`;
            
            const payment = await api.createPayment(order.id, returnUrl);
            
            // Перенаправляем на страницу оплаты ЮKassa
            window.location.href = payment.confirmationUrl;
            
        } catch (error) {
            console.error('Ошибка оплаты:', error);
            showToast('Ошибка при создании платежа', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form">
            <h3>Способ оплаты</h3>
            
            <div className="payment-methods">
                <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-content">
                        <span className="method-icon">💳</span>
                        <div className="method-info">
                            <span className="method-title">Банковская карта</span>
                            <span className="method-description">Visa, Mastercard, МИР</span>
                        </div>
                    </div>
                </label>

                <label className={`payment-method ${paymentMethod === 'sbp' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        name="payment"
                        value="sbp"
                        checked={paymentMethod === 'sbp'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-content">
                        <span className="method-icon">📱</span>
                        <div className="method-info">
                            <span className="method-title">СБП</span>
                            <span className="method-description">Система быстрых платежей</span>
                        </div>
                    </div>
                </label>

                <label className={`payment-method ${paymentMethod === 'yoomoney' ? 'selected' : ''}`}>
                    <input
                        type="radio"
                        name="payment"
                        value="yoomoney"
                        checked={paymentMethod === 'yoomoney'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-content">
                        <span className="method-icon">💰</span>
                        <div className="method-info">
                            <span className="method-title">ЮMoney</span>
                            <span className="method-description">Кошелек, интернет-банк</span>
                        </div>
                    </div>
                </label>
            </div>

            <div className="payment-summary">
                <div className="summary-row">
                    <span>Сумма к оплате:</span>
                    <span className="summary-total">{order.total_amount.toLocaleString()} ₽</span>
                </div>
            </div>

            <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? 'Создание платежа...' : 'Перейти к оплате'}
            </Button>

            <p className="payment-security">
                🔒 Безопасная оплата через ЮKassa
            </p>
        </div>
    );
};

export default PaymentForm;