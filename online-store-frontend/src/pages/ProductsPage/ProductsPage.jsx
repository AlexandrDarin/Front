import React, { useEffect, useState } from 'react';
import './ProductsPage.scss';
import { api } from '../../api';

const ProductCard = ({ product, onEdit, onDelete, onAddToCart }) => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i}>
                    {i <= Math.round(rating) ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="product-card">
            {product.stock > 0 && (
                <div className="product-card__badge">В наличии</div>
            )}
            <div className="product-card__image">
                <img 
                    src={product.image || '/images/product.jpg'} 
                    alt={product.name}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
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
                        {renderStars(product.rating || 0)}
                    </div>
                    <span className="value">
                        {product.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="count">(отзывы)</span>
                </div>

                <div className="product-card__price">
                    {product.price.toLocaleString()} ₽
                    <small> шт.</small>
                </div>
                
                <div className={`product-card__stock ${
                    product.stock > 0 ? 'product-card__stock--in' : 'product-card__stock--out'
                }`}>
                    {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                </div>

                <div className="product-card__actions">
                    <button 
                        className="btn btn--primary"
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock === 0}
                    >
                        {product.stock > 0 ? '🛒 В корзину' : 'Нет в наличии'}
                    </button>
                    <button 
                        className="btn btn--outline"
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
};

const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart }) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={`cart ${isOpen ? 'cart--open' : ''}`}>
            <div className="cart__header">
                <h2>Корзина</h2>
                <button className="cart__close" onClick={onClose}>×</button>
            </div>
            
            <div className="cart__items">
                {cartItems.length === 0 ? (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3>Корзина пуста</h3>
                        <p>Добавьте товары, чтобы оформить заказ</p>
                    </div>
                ) : (
                    cartItems.map(item => (
                        <div key={item.id} className="cart__item">
                            <img src={item.image || '/images/product.jpg'} alt={item.name} />
                            <div className="cart__item-info">
                                <h4>{item.name}</h4>
                                <p>{item.category}</p>
                                <div className="cart__item-price">
                                    {item.price.toLocaleString()} ₽
                                </div>
                            </div>
                            <div className="cart__item-actions">
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                                <button onClick={() => onRemoveFromCart(item.id)}>×</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {cartItems.length > 0 && (
                <div className="cart__footer">
                    <div className="total">
                        <span>Итого:</span>
                        <span>{total.toLocaleString()} ₽</span>
                    </div>
                    <button className="checkout-btn">
                        Оформить заказ
                    </button>
                </div>
            )}
        </div>
    );
};

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        rating: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                rating: product.rating?.toString() || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                rating: ''
            });
        }
    }, [product]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert('Введите название товара');
            return;
        }
        if (!formData.category) {
            alert('Выберите категорию');
            return;
        }
        
        const price = Number(formData.price);
        if (!price || price < 0) {
            alert('Введите корректную цену');
            return;
        }

        onSubmit({
            ...formData,
            price,
            stock: Number(formData.stock) || 0,
            rating: Number(formData.rating) || 0
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>
                
                <div className="modal__content">
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form__group">
                            <label className="form__label">Название товара *</label>
                            <input
                                type="text"
                                className="form__input"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Например, iPhone 15 Pro"
                            />
                        </div>

                        <div className="form__group">
                            <label className="form__label">Категория *</label>
                            <select
                                className="form__input"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form__group">
                            <label className="form__label">Описание</label>
                            <textarea
                                className="form__textarea"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Описание товара..."
                            />
                        </div>

                        <div className="form__row">
                            <div className="form__group">
                                <label className="form__label">Цена (₽) *</label>
                                <input
                                    type="number"
                                    className="form__input"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    placeholder="99990"
                                    min="0"
                                />
                            </div>

                            <div className="form__group">
                                <label className="form__label">Количество *</label>
                                <input
                                    type="number"
                                    className="form__input"
                                    value={formData.stock}
                                    onChange={e => setFormData({...formData, stock: e.target.value})}
                                    placeholder="10"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form__group">
                            <label className="form__label">Рейтинг (0-5)</label>
                            <input
                                type="number"
                                className="form__input"
                                value={formData.rating}
                                onChange={e => setFormData({...formData, rating: e.target.value})}
                                placeholder="4.5"
                                min="0"
                                max="5"
                                step="0.1"
                            />
                        </div>

                        <div className="form__actions">
                            <button type="button" className="btn btn--outline" onClick={onClose}>
                                Отмена
                            </button>
                            <button type="submit" className="btn btn--primary">
                                {product ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        inStock: false
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const filterParams = {};
            if (filters.category) filterParams.category = filters.category;
            if (filters.inStock) filterParams.inStock = 'true';
            
            const data = await api.getProducts(filterParams);
            setProducts(data.products || []);
        } catch (err) {
            console.error('Ошибка загрузки товаров:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Ошибка загрузки категорий:', err);
        }
    };

    const handleAddToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setCartOpen(true);
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить товар?')) return;
        
        try {
            await api.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert('Ошибка удаления товара');
        }
    };

    const handleSubmitModal = async (productData) => {
        try {
            if (editingProduct) {
                const updated = await api.updateProduct(editingProduct.id, productData);
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
            } else {
                const created = await api.createProduct(productData);
                setProducts(prev => [...prev, created]);
            }
            setModalOpen(false);
            setEditingProduct(null);
            loadCategories();
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Ошибка сохранения товара');
        }
    };

    const filteredProducts = products.filter(product => {
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">🛍️ TechStore</div>
                    
                    <div className="search">
                        <input
                            type="text"
                            className="search__input"
                            placeholder="Поиск товаров..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="cart-icon" onClick={() => setCartOpen(true)}>
                        <svg viewBox="0 0 24 24">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartItems.length > 0 && (
                            <span className="cart-icon__badge">{cartItems.length}</span>
                        )}
                    </div>
                </div>
            </header>

            <div className="theme-switcher">
                <button
                    className={`theme-switcher__btn theme-switcher__btn--light ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                >
                    ☀️ Светлая
                </button>
                <button
                    className={`theme-switcher__btn theme-switcher__btn--dark ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                >
                    🌙 Темная
                </button>
            </div>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1>Каталог товаров</h1>
                        <button 
                            className="btn btn--primary"
                            onClick={() => {
                                setEditingProduct(null);
                                setModalOpen(true);
                            }}
                        >
                            + Добавить товар
                        </button>
                    </div>

                    <div className="filters">
                        <div className="filters__group">
                            <label className="filters__label">Категория</label>
                            <select
                                className="filters__select"
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="">Все категории</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filters__group">
                            <label className="filters__checkbox">
                                <input
                                    type="checkbox"
                                    checked={filters.inStock}
                                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                                />
                                Только в наличии
                            </label>
                        </div>

                        <button
                            className="filters__reset"
                            onClick={() => setFilters({ category: '', inStock: false })}
                        >
                            Сбросить фильтры
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="loading__spinner"></div>
                            <p>Загрузка товаров...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 12H4M12 4v16" />
                            </svg>
                            <h3>Товары не найдены</h3>
                            <p>Попробуйте изменить параметры поиска</p>
                            <button 
                                className="btn btn--primary"
                                onClick={() => {
                                    setEditingProduct(null);
                                    setModalOpen(true);
                                }}
                            >
                                Добавить первый товар
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={(product) => {
                                        setEditingProduct(product);
                                        setModalOpen(true);
                                    }}
                                    onDelete={handleDelete}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} TechStore. Все права защищены.
                    <br />
                    <small>Интернет-магазин электроники</small>
                </div>
            </footer>

            <Cart
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
            />

            <ProductModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSubmitModal}
                product={editingProduct}
                categories={categories}
            />
        </div>
    );
}