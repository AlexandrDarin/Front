import React, { useEffect, useState } from 'react';
import Button from './UI/Button';
import Input from './UI/Input';
import './ProductModal.scss';

const ProductModal = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    rating: '',
    image: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        rating: product.rating?.toString() || '',
        image: product.image || ''
      });
    } else {
      setFormData({
        title: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        rating: '',
        image: ''
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
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
        <div className="modal-header">
          <h2>{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <Input
              label="Название товара"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Например, iPhone 15 Pro"
              required
            />
            
            <Input
              label="URL изображения"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
            
            <div className="form-group">
              <label className="input-label">Категория *</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Выберите категорию</option>
                {categories?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <textarea
              className="textarea-field"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Описание товара..."
              rows={3}
            />
            
            <div className="form-row">
              <Input
                label="Цена (₽)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="99990"
                required
              />
              <Input
                label="Количество"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                placeholder="10"
              />
            </div>
            
            <Input
              label="Рейтинг (0-5)"
              type="number"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: e.target.value})}
              placeholder="4.5"
              step="0.1"
              min="0"
              max="5"
            />
            
            <div className="form-actions">
              <Button variant="secondary" onClick={onClose}>Отмена</Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
