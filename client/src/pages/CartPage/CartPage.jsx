import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/UI/Button';
import './CartPage.scss';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-icon">🛒</div>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары, чтобы оформить заказ</p>
        <Link to="/">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image || 'https://via.placeholder.com/100'} alt={item.title} />
              <div className="item-info">
                <h3>{item.title}</h3>
                <p className="item-price">{item.price?.toLocaleString()} ₽</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">
                {(item.price * item.quantity).toLocaleString()} ₽
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Итого</h3>
          <div className="summary-row">
            <span>Товары ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} шт):</span>
            <span>{getCartTotal().toLocaleString()} ₽</span>
          </div>
          <div className="summary-row total">
            <span>К оплате:</span>
            <span>{getCartTotal().toLocaleString()} ₽</span>
          </div>
          <Button fullWidth>Оформить заказ</Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;