import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/UI/Button';
import './WishlistPage.scss';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist">
        <div className="empty-icon">❤️</div>
        <h2>В избранном пока пусто</h2>
        <p>Добавляйте товары, чтобы не потерять их</p>
        <Link to="/">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Избранное</h1>
        <Button variant="secondary" onClick={clearWishlist}>Очистить всё</Button>
      </div>
      
      <div className="wishlist-grid">
        {wishlistItems.map(product => (
          <div key={product.id} className="wishlist-card">
            <button className="remove-btn" onClick={() => removeFromWishlist(product.id)}>×</button>
            <Link to={`/product/${product.id}`}>
              <img src={product.image || 'https://via.placeholder.com/200'} alt={product.title} />
            </Link>
            <h3>{product.title}</h3>
            <div className="price">{product.price?.toLocaleString()} ₽</div>
            <Button onClick={() => handleAddToCart(product)}>В корзину</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;