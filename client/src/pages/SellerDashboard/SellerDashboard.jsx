import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button';
import ProductModal from '../../components/ProductModal';
import './SellerDashboard.scss';

const SellerDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        averageRating: 0
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const productsData = await api.getProducts();
            const userProducts = productsData.products.filter(p => p.createdBy === user?.email);
            setProducts(userProducts);

            // Рассчитываем статистику
            const totalStock = userProducts.reduce((sum, p) => sum + p.stock, 0);
            const totalValue = userProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
            const avgRating = userProducts.reduce((sum, p) => sum + p.rating, 0) / (userProducts.length || 1);

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

    const handleProductSubmit = async (productData) => {
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

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
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
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    + Добавить товар
                </Button>
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

            <div className="products-table">
                <h2>Мои товары</h2>
                
                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : (
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
                                    <td>{product.price.toLocaleString()} ₽</td>
                                    <td>
                                        <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="rating">
                                            <span className="stars">
                                                {'★'.repeat(Math.round(product.rating))}
                                            </span>
                                            <span>{product.rating}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <Button 
                                                size="small" 
                                                variant="outline"
                                                onClick={() => handleEditProduct(product)}
                                            >
                                                ✎
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant="danger"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ProductModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleProductSubmit}
                product={editingProduct}
                categories={[...new Set(products.map(p => p.category))]}
            />
        </div>
    );
};

export default SellerDashboard;