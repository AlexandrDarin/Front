import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/UI/Button';
import './ComparePage.scss';

const ComparePage = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Получаем все уникальные характеристики
    const getAllSpecs = () => {
        const specs = new Set();
        compareItems.forEach(product => {
            if (product.specs) {
                Object.keys(product.specs).forEach(key => specs.add(key));
            }
        });
        return Array.from(specs);
    };

    const specs = getAllSpecs();

    if (compareItems.length === 0) {
        return (
            <div className="compare-page">
                <div className="container">
                    <div className="compare-empty">
                        <div className="empty-icon">⚖️</div>
                        <h2>Список сравнения пуст</h2>
                        <p>Добавьте товары, чтобы сравнить их характеристики</p>
                        <Button onClick={() => navigate('/')}>
                            Перейти в каталог
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <div className="container">
                <div className="compare-header">
                    <h1 className="compare-title">Сравнение товаров</h1>
                    <Button variant="outline" onClick={clearCompare}>
                        Очистить все
                    </Button>
                </div>

                <div className="compare-table-wrapper">
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th className="spec-name">Характеристики</th>
                                {compareItems.map(product => (
                                    <th key={product.id} className="product-header">
                                        <button 
                                            className="remove-btn"
                                            onClick={() => removeFromCompare(product.id)}
                                        >
                                            ×
                                        </button>
                                        <img 
                                            src={product.image} 
                                            alt={product.title}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        />
                                        <h3 onClick={() => navigate(`/product/${product.id}`)}>
                                            {product.title}
                                        </h3>
                                        <div className="product-price">
                                            {product.price.toLocaleString()} ₽
                                        </div>
                                        <Button 
                                            variant="primary" 
                                            size="small"
                                            onClick={() => addToCart(product)}
                                        >
                                            В корзину
                                        </Button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Базовая информация */}
                            <tr>
                                <td className="spec-name">Категория</td>
                                {compareItems.map(product => (
                                    <td key={product.id}>{product.category}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="spec-name">Цена</td>
                                {compareItems.map(product => (
                                    <td key={product.id} className="price-cell">
                                        {product.price.toLocaleString()} ₽
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="spec-name">Рейтинг</td>
                                {compareItems.map(product => (
                                    <td key={product.id}>
                                        <div className="rating">
                                            <span className="stars">
                                                {'★'.repeat(Math.round(product.rating))}
                                                {'☆'.repeat(5 - Math.round(product.rating))}
                                            </span>
                                            <span>{product.rating}</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="spec-name">Наличие</td>
                                {compareItems.map(product => (
                                    <td key={product.id}>
                                        <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {product.stock > 0 ? `${product.stock} шт` : 'Нет'}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            
                            {/* Дополнительные характеристики */}
                            {specs.map(spec => (
                                <tr key={spec}>
                                    <td className="spec-name">{spec}</td>
                                    {compareItems.map(product => (
                                        <td key={product.id}>
                                            {product.specs?.[spec] || '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparePage;