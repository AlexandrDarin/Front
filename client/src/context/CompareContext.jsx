import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext();

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);
    const { showToast } = useToast();
    const MAX_COMPARE_ITEMS = 4;

    useEffect(() => {
        const savedCompare = localStorage.getItem('compare');
        if (savedCompare) {
            setCompareItems(JSON.parse(savedCompare));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('compare', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        setCompareItems(prev => {
            if (prev.some(item => item.id === product.id)) {
                showToast('Товар уже в списке сравнения', 'info');
                return prev;
            }
            
            if (prev.length >= MAX_COMPARE_ITEMS) {
                showToast(`Можно сравнить не более ${MAX_COMPARE_ITEMS} товаров`, 'warning');
                return prev;
            }

            showToast('Товар добавлен в сравнение', 'success');
            return [...prev, product];
        });
    };

    const removeFromCompare = (productId) => {
        setCompareItems(prev => {
            showToast('Товар удален из сравнения', 'warning');
            return prev.filter(item => item.id !== productId);
        });
    };

    const clearCompare = () => {
        setCompareItems([]);
        showToast('Список сравнения очищен', 'info');
    };

    const isInCompare = (productId) => {
        return compareItems.some(item => item.id === productId);
    };

    return (
        <CompareContext.Provider value={{
            compareItems,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            compareCount: compareItems.length,
            maxCompare: MAX_COMPARE_ITEMS
        }}>
            {children}
        </CompareContext.Provider>
    );
};