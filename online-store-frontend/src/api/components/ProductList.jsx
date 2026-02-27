import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, onEdit, onDelete }) {
    if (!products.length) {
        return (
            <div className="empty">
                Товары не найдены. Попробуйте изменить фильтры или добавьте новый товар.
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <ProductCard 
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}