import React, { useEffect, useState } from 'react';
import './ProductsPage.scss';
import { api } from '../../api';
import Button from '../../components/UI/Button';

const ProductCard = ({ product, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star">☆</span>);
            }
        }
        return stars;
    };

    return (
        <div 
            className={`product-card ${isHovered ? 'hovered' : ''} ${!imageLoaded ? 'loading' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card__glow"></div>
            
            <div className="product-card__badges">
                {product.stock > 5 && (
                    <span className="badge in-stock">В наличии {product.stock} шт</span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                    <span className="badge limited">Осталось {product.stock} шт</span>
                )}
                {product.stock === 0 && (
                    <span className="badge out-stock">Нет в наличии</span>
                )}
                {product.rating >= 4.8 && (
                    <span className="badge hit">Топ продаж</span>
                )}
                {product.rating >= 4.5 && product.rating < 4.8 && (
                    <span className="badge hit">Хит</span>
                )}
                {product.isNew && (
                    <span className="badge new">Новинка</span>
                )}
            </div>

            <div className="product-card__image-wrapper">
                {!imageLoaded && (
                    <div className="product-card__image-skeleton">
                        <div className="skeleton-shimmer"></div>
                    </div>
                )}
                <div className="product-card__image">
                    <img 
                        src={product.image || 'https://via.placeholder.com/400x300?text=TechStore'} 
                        alt={product.title || product.name}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            setImageLoaded(true);
                        }}
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                    />
                </div>
                <div className="product-card__quick-actions">
                    <button className="quick-action" title="Быстрый просмотр">👁️</button>
                    <button className="quick-action" title="В избранное">❤️</button>
                    <button className="quick-action" title="Сравнить">⚖️</button>
                </div>
            </div>

            <div className="product-card__content">
                <div className="product-card__category">
                    {product.category}
                    <span className="category-arrow">→</span>
                </div>

                <h3 className="product-card__title">
                    {product.title || product.name}
                </h3>

                <p className="product-card__description">
                    {product.description?.length > 80 
                        ? `${product.description.substring(0, 80)}...` 
                        : product.description || 'Премиальное качество и инновационные технологии'}
                </p>

                <div className="product-card__rating">
                    <div className="stars">
                        {renderStars(product.rating)}
                    </div>
                    <span className="rating-value">
                        {product.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="rating-count">(156)</span>
                </div>

                <div className="product-card__price-section">
                    <div className="product-card__price">
                        {product.price?.toLocaleString()} ₽
                    </div>
                    <div className="product-card__installment">
                        или {(product.price / 24).toFixed(0)} ₽/мес
                    </div>
                </div>

                <div className="product-card__stock-indicator">
                    <div className="stock-bar">
                        <div 
                            className="stock-fill" 
                            style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <span className="stock-text">
                        {product.stock > 0 ? `${product.stock} шт в наличии` : 'Нет в наличии'}
                    </span>
                </div>

                <div className="product-card__actions">
                    <Button 
                        variant="primary"
                        onClick={() => onAddToCart(product)}
                        disabled={product.stock === 0}
                        fullWidth
                    >
                        <span className="btn__icon">🛒</span>
                        <span className="btn__text">
                            {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);
            setProducts(productsData.products || []);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Поиск
        if (searchQuery) {
            filtered = filtered.filter(p => 
                (p.title || p.name).toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Категория
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Цена
        filtered = filtered.filter(p => 
            p.price >= priceRange.min && p.price <= priceRange.max
        );

        // Сортировка
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
                filtered.sort((a, b) => (b.stock * b.rating) - (a.stock * a.rating));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const handleAddToCart = (product) => {
        // Здесь будет логика добавления в корзину
        console.log('Добавлено в корзину:', product);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortBy('default');
        setPriceRange({ min: 0, max: 500000 });
    };

    return (
        <div className="products-page">
            {/* Герой-секция */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-shape shape-1"></div>
                    <div className="hero-shape shape-2"></div>
                    <div className="hero-shape shape-3"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            <span className="hero-title-line">Премиальная</span>
                            <span className="hero-title-line gradient">электроника</span>
                        </h1>
                        <p className="hero-subtitle">
                            Откройте мир инновационных технологий с TechStore
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">10k+</span>
                                <span className="stat-label">Товаров</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50k+</span>
                                <span className="stat-label">Клиентов</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">4.9</span>
                                <span className="stat-label">Рейтинг</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Поиск и фильтры */}
                <div className="search-section">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск среди 1000+ товаров..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-button">
                            <span className="search-icon">🔍</span>
                        </button>
                    </div>
                    
                    <button 
                        className={`filters-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <span className="filters-icon">⚙️</span>
                        <span>Фильтры</span>
                        <span className="filters-arrow">{showFilters ? '▲' : '▼'}</span>
                    </button>
                </div>

                {/* Расширенные фильтры */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label">Категория</label>
                                <select 
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="default">По умолчанию</option>
                                    <option value="price-asc">Сначала дешевле</option>
                                    <option value="price-desc">Сначала дороже</option>
                                    <option value="rating">По рейтингу</option>
                                    <option value="popular">Популярные</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Цена</label>
                                <div className="price-range">
                                    <input
                                        type="number"
                                        className="price-input"
                                        placeholder="От"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                    />
                                    <span className="price-separator">—</span>
                                    <input
                                        type="number"
                                        className="price-input"
                                        placeholder="До"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="clear-filters" onClick={clearFilters}>
                            Сбросить все фильтры
                        </button>
                    </div>
                )}

                {/* Результаты поиска */}
                <div className="results-info">
                    <h2 className="results-title">
                        {filteredProducts.length} товаров
                        {selectedCategory && ` в категории "${selectedCategory}"`}
                        {searchQuery && ` по запросу "${searchQuery}"`}
                    </h2>
                </div>

                {/* Сетка товаров */}
                {loading ? (
                    <div className="loading-grid">
                        {[1,2,3,4,5,6].map(n => (
                            <div key={n} className="product-card-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Товары не найдены</h3>
                        <p>Попробуйте изменить параметры поиска</p>
                        <Button variant="primary" onClick={clearFilters}>
                            Сбросить фильтры
                        </Button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;