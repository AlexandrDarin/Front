import React, { useEffect, useState } from 'react';
import './ProductsPage.scss';
import { api } from '../../api';

const ProductCard = ({ product, onAddToCart, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= Math.round(rating || 0) ? 'filled' : ''}`}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div 
            className={`product-card ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card__glow"></div>
            
            <div className="product-card__badges">
                {product.stock > 0 ? (
                    <span className="badge in-stock">В наличии</span>
                ) : (
                    <span className="badge out-stock">Нет в наличии</span>
                )}
                {product.rating >= 4.5 && (
                    <span className="badge hit">Хит продаж</span>
                )}
            </div>

            <div className="product-card__image-wrapper">
                <div className="product-card__image">
                    <img 
                        src={product.image || 'https://via.placeholder.com/400x300?text=TechStore'} 
                        alt={product.name}
                    />
                </div>
            </div>

            <div className="product-card__content">
                <div className="product-card__category">
                    {product.category}
                </div>

                <h3 className="product-card__title">
                    {product.name}
                </h3>

                <p className="product-card__description">
                    {product.description || 'Премиальное качество и инновационные технологии'}
                </p>

                <div className="product-card__rating">
                    <div className="stars">
                        {renderStars(product.rating)}
                    </div>
                    <span className="rating-value">
                        {product.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="rating-count">(124 отзыва)</span>
                </div>

                <div className="product-card__price-section">
                    <div className="product-card__price">
                        {product.price?.toLocaleString()} ₽
                    </div>
                    <div className="product-card__installment">
                        от {(product.price / 24).toFixed(0)} ₽/мес
                    </div>
                </div>

                <div className="product-card__actions">
                    <button 
                        className="btn btn--primary"
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock === 0}
                    >
                        <span className="btn__icon">🛒</span>
                        <span className="btn__text">В корзину</span>
                    </button>
                    <button 
                        className="btn btn--outline"
                        onClick={() => onEdit(product)}
                    >
                        <span className="btn__icon">✎</span>
                    </button>
                    <button 
                        className="btn btn--danger"
                        onClick={() => onDelete(product.id)}
                    >
                        <span className="btn__icon">×</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={onClose}>
            <div className="cart" onClick={e => e.stopPropagation()}>
                <div className="cart__header">
                    <h2>Корзина</h2>
                    <button className="cart__close" onClick={onClose}>×</button>
                </div>

                <div className="cart__items">
                    {items.length === 0 ? (
                        <div className="cart__empty">
                            <div className="empty-icon">🛒</div>
                            <h3>Корзина пуста</h3>
                            <p>Добавьте товары, чтобы оформить заказ</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="cart__item">
                                <img src={item.image} alt={item.name} className="cart__item-image" />
                                <div className="cart__item-info">
                                    <h4>{item.name}</h4>
                                    <p>{item.category}</p>
                                    <div className="cart__item-price">
                                        {item.price.toLocaleString()} ₽
                                    </div>
                                </div>
                                <div className="cart__item-actions">
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>−</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                                    <button className="remove" onClick={() => onRemove(item.id)}>×</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart__footer">
                        <div className="cart__total">
                            <span>Итого:</span>
                            <span className="total-price">{total.toLocaleString()} ₽</span>
                        </div>
                        <button className="btn btn--primary btn--large">
                            Оформить заказ
                        </button>
                    </div>
                )}
            </div>
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
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Название товара *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Например, iPhone 15 Pro"
                            />
                        </div>

                        <div className="form-group">
                            <label>Категория *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Описание</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Описание товара..."
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Цена (₽) *</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                    placeholder="99990"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Количество *</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({...formData, stock: e.target.value})}
                                    placeholder="10"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Рейтинг (0-5)</label>
                            <input
                                type="number"
                                value={formData.rating}
                                onChange={e => setFormData({...formData, rating: e.target.value})}
                                placeholder="4.5"
                                min="0"
                                max="5"
                                step="0.1"
                            />
                        </div>

                        <div className="form-actions">
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
    const [theme, setTheme] = useState('dark');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        inStock: false,
        sortBy: 'default'
    });
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [filters.category, filters.inStock]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const filterParams = {};
            if (filters.category) filterParams.category = filters.category;
            if (filters.inStock) filterParams.inStock = 'true';
            
            const data = await api.getProducts(filterParams);
            let sortedProducts = data.products || [];
            
            if (filters.sortBy === 'price-asc') {
                sortedProducts.sort((a, b) => a.price - b.price);
            } else if (filters.sortBy === 'price-desc') {
                sortedProducts.sort((a, b) => b.price - a.price);
            } else if (filters.sortBy === 'rating') {
                sortedProducts.sort((a, b) => b.rating - a.rating);
            }
            
            setProducts(sortedProducts);
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
        setIsCartOpen(true);
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
            setIsModalOpen(false);
            setEditingProduct(null);
            loadCategories();
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Ошибка сохранения товара');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page">
            {/* Хедер */}
            <header className="header">
                <div className="header__inner">
                    <div className="brand">
                        <span className="brand__icon">⚡</span>
                        <span className="brand__text">TechStore</span>
                        <span className="brand__badge">PRO</span>
                    </div>

                    <div className="search">
                        <input
                            type="text"
                            className="search__input"
                            placeholder="Поиск среди 1000+ товаров..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search__btn">🔍</button>
                    </div>

                    <div className="header__actions">
                        <div className="theme-switcher">
                            <button
                                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                ☀️
                            </button>
                            <button
                                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                🌙
                            </button>
                        </div>

                        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                            <span className="cart-btn__icon">🛒</span>
                            {cartItems.length > 0 && (
                                <span className="cart-btn__badge">{cartItems.length}</span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Основной контент */}
            <main className="main">
                <div className="container">
                    {/* Хлебные крошки */}
                    <div className="breadcrumbs">
                        <span>Главная</span> / <span>Каталог</span> / <span className="current">Все товары</span>
                    </div>

                    {/* Заголовок и кнопки */}
                    <div className="toolbar">
                        <h1 className="page-title">
                            Каталог товаров
                            <span className="page-title__count">{filteredProducts.length}</span>
                        </h1>
                        <button 
                            className="btn btn--primary btn--large"
                            onClick={() => {
                                setEditingProduct(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <span className="btn__icon">+</span>
                            <span className="btn__text">Добавить товар</span>
                        </button>
                    </div>

                    {/* Фильтры */}
                    <div className="filters-panel">
                        <div className="filters">
                            <div className="filter-group">
                                <label className="filter-label">Категория</label>
                                <select
                                    className="filter-select"
                                    value={filters.category}
                                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                                >
                                    <option value="">Все категории</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Сортировка</label>
                                <select
                                    className="filter-select"
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                >
                                    <option value="default">По умолчанию</option>
                                    <option value="price-asc">Сначала дешевле</option>
                                    <option value="price-desc">Сначала дороже</option>
                                    <option value="rating">По рейтингу</option>
                                </select>
                            </div>

                            <div className="filter-group filter-group--checkbox">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                                    />
                                    <span className="checkbox__text">Только в наличии</span>
                                </label>
                            </div>
                        </div>

                        {(filters.category || filters.sortBy !== 'default' || filters.inStock) && (
                            <button
                                className="filters-reset"
                                onClick={() => setFilters({ category: '', inStock: false, sortBy: 'default' })}
                            >
                                <span className="reset-icon">↺</span>
                                Сбросить фильтры
                            </button>
                        )}
                    </div>

                    {/* Товары */}
                    {loading ? (
                        <div className="loading">
                            <div className="loading__spinner"></div>
                            <p>Загружаем премиальные товары...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🔍</div>
                            <h3>Товары не найдены</h3>
                            <p>Попробуйте изменить параметры поиска</p>
                            <button 
                                className="btn btn--primary"
                                onClick={() => {
                                    setEditingProduct(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                Добавить товар
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onEdit={(product) => {
                                        setEditingProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Футер */}
            <footer className="footer">
                <div className="footer__inner">
                    <div className="footer__grid">
                        <div className="footer__col">
                            <h4>TechStore</h4>
                            <ul>
                                <li>О компании</li>
                                <li>Контакты</li>
                                <li>Вакансии</li>
                            </ul>
                        </div>
                        <div className="footer__col">
                            <h4>Покупателям</h4>
                            <ul>
                                <li>Доставка</li>
                                <li>Оплата</li>
                                <li>Гарантия</li>
                            </ul>
                        </div>
                        <div className="footer__col">
                            <h4>Мы в соцсетях</h4>
                            <ul>
                                <li>Telegram</li>
                                <li>VK</li>
                                <li>YouTube</li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer__bottom">
                        © {new Date().getFullYear()} TechStore. Премиальная электроника
                    </div>
                </div>
            </footer>

            {/* Модальные окна */}
            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
            />

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSubmitModal}
                product={editingProduct}
                categories={categories}
            />
        </div>
    );
}