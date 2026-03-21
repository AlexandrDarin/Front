import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import Button from '../../components/UI/Button';
import './ComparePage.scss';

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) {
    return (
      <div className="empty-compare">
        <div className="empty-icon">⚖️</div>
        <h2>Список сравнения пуст</h2>
        <p>Добавьте товары, чтобы сравнить их характеристики</p>
        <Link to="/">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>Сравнение товаров</h1>
        <Button variant="secondary" onClick={clearCompare}>Очистить всё</Button>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Характеристики</th>
              {compareItems.map(product => (
                <th key={product.id}>
                  <button className="remove-btn" onClick={() => removeFromCompare(product.id)}>×</button>
                  <img src={product.image || 'https://via.placeholder.com/150'} alt={product.title} />
                  <h3>{product.title}</h3>
                  <div className="price">{product.price?.toLocaleString()} ₽</div>
                  <Link to={`/product/${product.id}`}>
                    <Button size="small">Подробнее</Button>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="spec-name">Категория</td>
              {compareItems.map(product => (
                <td key={product.id}>{product.category}</td>
              ))}
            </tr>
            <tr>
              <td className="spec-name">Цена</td>
              {compareItems.map(product => (
                <td key={product.id}>{product.price?.toLocaleString()} ₽</td>
              ))}
            </tr>
            <tr>
              <td className="spec-name">Рейтинг</td>
              {compareItems.map(product => (
                <td key={product.id}>⭐ {product.rating}</td>
              ))}
            </tr>
            <tr>
              <td className="spec-name">Наличие</td>
              {compareItems.map(product => (
                <td key={product.id}>
                  {product.stock > 0 ? `${product.stock} шт` : 'Нет в наличии'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;