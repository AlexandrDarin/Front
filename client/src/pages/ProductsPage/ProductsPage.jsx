import React, { useState, useEffect } from 'react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки товаров:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка товаров...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Ошибка: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Каталог товаров</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #ccc', 
            padding: '15px', 
            borderRadius: '8px',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <h3>{product.title}</h3>
            <p style={{ color: '#4361ee', fontSize: '18px', fontWeight: 'bold' }}>
              {product.price?.toLocaleString()} ₽
            </p>
            {product.rating && (
              <p>⭐ {product.rating}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
