import React from 'react';

export default function ProductCard({ product, onEdit, onDelete }) {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i}>
                    {i <= rating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="product-card">
            <div className="product-card__image">
                <img 
                    src={product.image || '/images/product.jpg'} 
                    alt={product.name}
                    onError={(e) => {
                        e.target.src = '/images/product.jpg';
                    }}
                />
            </div>
            
            <div className="product-card__content">
                <div className="product-card__category">
                    {product.category}
                </div>
                
                <h3 className="product-card__title">
                    {product.name}
                </h3>
                
                <p className="product-card__description">
                    {product.description}
                </p>

                <div className="product-card__rating">
                    <div className="stars">
                        {renderStars(Math.round(product.rating || 0))}
                    </div>
                    <span className="value">
                        {product.rating?.toFixed(1) || '0.0'}
                    </span>
                </div>

                <div className="product-card__details">
                    <div className="product-card__price">
                        {product.price.toLocaleString()} ₽
                        <small> шт.</small>
                    </div>
                    
                    <div className={`product-card__stock ${
                        product.stock > 0 ? 'product-card__stock--in' : 'product-card__stock--out'
                    }`}>
                        {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
                    </div>
                </div>

                <div className="product-card__actions">
                    <button 
                        className="btn btn--primary"
                        onClick={() => onEdit(product)}
                    >
                        ✎ Изменить
                    </button>
                    <button 
                        className="btn btn--danger"
                        onClick={() => onDelete(product.id)}
                    >
                        × Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}