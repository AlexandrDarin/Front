import React from 'react';
import './CartPage.scss';

const CartPage = () => {
    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="cart-title">Корзина</h1>
                <div className="cart-empty">
                    <div className="cart-empty__icon">🛒</div>
                    <h2>Корзина пуста</h2>
                    <p>Добавьте товары, чтобы оформить заказ</p>
                </div>
            </div>
        </div>
    );
};

export default CartPage;