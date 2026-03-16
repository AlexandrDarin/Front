import React, { useState, useEffect } from 'react';
import './AdvancedFilters.scss';

const AdvancedFilters = ({ onFilterChange, categories, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        category: initialFilters.category || '',
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        inStock: initialFilters.inStock || false,
        rating: initialFilters.rating || 0,
        sortBy: initialFilters.sortBy || 'default',
        search: initialFilters.search || ''
    });

    const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(filters);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({ ...prev, [type]: value }));
        setFilters(prev => ({
            ...prev,
            priceMin: type === 'min' ? value : prev.priceMin,
            priceMax: type === 'max' ? value : prev.priceMax
        }));
    };

    const handleRatingChange = (rating) => {
        setFilters(prev => ({ ...prev, rating }));
    };

    const resetFilters = () => {
        setFilters({
            category: '',
            priceMin: '',
            priceMax: '',
            inStock: false,
            rating: 0,
            sortBy: 'default',
            search: ''
        });
        setPriceRange({ min: 0, max: 500000 });
    };

    const activeFiltersCount = Object.values(filters).filter(v => v && v !== 0 && v !== 'default').length;

    return (
        <div className="advanced-filters">
            <div className="filters-header">
                <div className="filters-title" onClick={() => setExpanded(!expanded)}>
                    <span className="title-icon">🔍</span>
                    <h3>Расширенный поиск</h3>
                    {activeFiltersCount > 0 && (
                        <span className="filters-badge">{activeFiltersCount}</span>
                    )}
                    <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
                        ▼
                    </span>
                </div>
                {activeFiltersCount > 0 && (
                    <button className="reset-btn" onClick={resetFilters}>
                        Сбросить все
                    </button>
                )}
            </div>

            {expanded && (
                <div className="filters-body">
                    {/* Поиск по названию */}
                    <div className="filter-section">
                        <label className="section-label">Поиск по названию</label>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleChange}
                                placeholder="Введите название товара..."
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                    </div>

                    <div className="filters-grid">
                        {/* Категория */}
                        <div className="filter-section">
                            <label className="section-label">Категория</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleChange}
                                className="filter-select"
                            >
                                <option value="">Все категории</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Сортировка */}
                        <div className="filter-section">
                            <label className="section-label">Сортировка</label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleChange}
                                className="filter-select"
                            >
                                <option value="default">По умолчанию</option>
                                <option value="price-asc">Цена: по возрастанию</option>
                                <option value="price-desc">Цена: по убыванию</option>
                                <option value="rating">По рейтингу</option>
                                <option value="popular">Популярные</option>
                                <option value="newest">Новинки</option>
                            </select>
                        </div>
                    </div>

                    {/* Ценовой диапазон */}
                    <div className="filter-section">
                        <label className="section-label">Цена, ₽</label>
                        <div className="price-range">
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="От"
                                    value={filters.priceMin}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    className="price-input"
                                    min="0"
                                />
                                <span className="price-separator">—</span>
                                <input
                                    type="number"
                                    placeholder="До"
                                    value={filters.priceMax}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    className="price-input"
                                    min="0"
                                />
                            </div>
                            <div className="price-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="500000"
                                    step="1000"
                                    value={filters.priceMin || 0}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    className="slider slider-min"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="500000"
                                    step="1000"
                                    value={filters.priceMax || 500000}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    className="slider slider-max"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Рейтинг */}
                    <div className="filter-section">
                        <label className="section-label">Минимальный рейтинг</label>
                        <div className="rating-filter">
                            {[5, 4, 3, 2, 1].map(rating => (
                                <button
                                    key={rating}
                                    className={`rating-btn ${filters.rating >= rating ? 'active' : ''}`}
                                    onClick={() => handleRatingChange(rating)}
                                >
                                    {rating} ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Дополнительные опции */}
                    <div className="filter-section options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="inStock"
                                checked={filters.inStock}
                                onChange={handleChange}
                            />
                            <span className="checkbox-text">Только в наличии</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;