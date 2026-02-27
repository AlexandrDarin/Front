import React, { useEffect, useState } from 'react';

export default function ProductModal({ 
    open, 
    mode, 
    initialProduct, 
    categories,
    onClose, 
    onSubmit 
}) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        rating: ''
    });

    useEffect(() => {
        if (!open) return;
        
        if (initialProduct) {
            setFormData({
                name: initialProduct.name || '',
                category: initialProduct.category || '',
                description: initialProduct.description || '',
                price: initialProduct.price?.toString() || '',
                stock: initialProduct.stock?.toString() || '',
                rating: initialProduct.rating?.toString() || ''
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
    }, [open, initialProduct]);

    if (!open) return null;

    const title = mode === 'edit' ? 'Редактирование товара' : 'Добавление товара';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валидация
        if (!formData.name.trim()) {
            alert('Введите название товара');
            return;
        }
        if (!formData.category) {
            alert('Выберите категорию');
            return;
        }
        
        const price = Number(formData.price);
        if (!Number.isFinite(price) || price < 0) {
            alert('Введите корректную цену');
            return;
        }

        const stock = Number(formData.stock);
        if (!Number.isFinite(stock) || stock < 0) {
            alert('Введите корректное количество');
            return;
        }

        const rating = Number(formData.rating);
        if (formData.rating && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
            alert('Рейтинг должен быть от 0 до 5');
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            name: formData.name.trim(),
            category: formData.category,
            description: formData.description.trim(),
            price: price,
            stock: stock,
            rating: rating || 0,
            image: initialProduct?.image || '/images/product.jpg'
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div 
                className="modal" 
                onMouseDown={(e) => e.stopPropagation()} 
                role="dialog" 
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button 
                        className="iconBtn" 
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        <span>Название товара *</span>
                        <input
                            className="input"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Например, iPhone 15 Pro"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        <span>Категория *</span>
                        <select
                            className="input"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </label>

                    <label className="label">
                        <span>Описание</span>
                        <textarea
                            className="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Описание товара..."
                            rows="3"
                        />
                    </label>

                    <label className="label">
                        <span>Цена (₽) *</span>
                        <input
                            className="input"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Например, 99990"
                            min="0"
                            step="1"
                        />
                    </label>

                    <label className="label">
                        <span>Количество на складе *</span>
                        <input
                            className="input"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="Например, 10"
                            min="0"
                            step="1"
                        />
                    </label>

                    <label className="label">
                        <span>Рейтинг (0-5)</span>
                        <input
                            className="input"
                            name="rating"
                            type="number"
                            value={formData.rating}
                            onChange={handleChange}
                            placeholder="Например, 4.5"
                            min="0"
                            max="5"
                            step="0.1"
                        />
                    </label>

                    <div className="modal__footer">
                        <button 
                            type="button" 
                            className="btn" 
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn--primary"
                        >
                            {mode === 'edit' ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}