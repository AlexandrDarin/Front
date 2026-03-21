import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import Button from '../../components/UI/Button';
import ProductModal from '../../components/ProductModal';
import './SellerDashboard.scss';

const SellerDashboard = () => {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      const userProducts = data.products.filter(p => p.created_by === user?.email);
      setProducts(userProducts);
      
      const totalStock = userProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
      const totalValue = userProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
      const avgRating = userProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / (userProducts.length || 1);
      
      setStats({
        totalProducts: userProducts.length,
        totalStock,
        totalValue,
        averageRating: avgRating.toFixed(1)
      });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить товар?')) return;
    
    try {
      await api.deleteProduct(productId);
      showToast('Товар удален', 'success');
      loadData();
    } catch (error) {
      showToast('Ошибка удаления товара', 'error');
    }
  };

  const handleSubmitModal = async (productData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        showToast('Товар обновлен', 'success');
      } else {
        await api.createProduct(productData);
        showToast('Товар создан', 'success');
      }
      setModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      showToast('Ошибка сохранения товара', 'error');
    }
  };

  if (!hasRole('seller')) {
    return (
      <div className="access-denied">
        <h2>Доступ запрещен</h2>
        <p>Эта страница доступна только продавцам</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Панель продавца</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>+ Добавить товар</Button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Товаров</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalStock}</span>
            <span className="stat-label">Единиц на складе</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalValue.toLocaleString()} ₽</span>
            <span className="stat-label">Общая стоимость</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">{stats.averageRating}</span>
            <span className="stat-label">Средний рейтинг</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="products-table">
          <h2>Мои товары</h2>
          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Рейтинг</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <img src={product.image} alt={product.title} />
                      <span>{product.title}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.price?.toLocaleString()} ₽</td>
                  <td>{product.stock}</td>
                  <td>⭐ {product.rating}</td>
                  <td>
                    <div className="actions">
                      <Button size="small" variant="secondary" onClick={() => handleEditProduct(product)}>
                        ✎
                      </Button>
                      <Button size="small" variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                        ×
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitModal}
        product={editingProduct}
        categories={[...new Set(products.map(p => p.category))]}
      />
    </div>
  );
};

export default SellerDashboard;