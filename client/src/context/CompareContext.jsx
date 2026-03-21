import React, { createContext, useState, useContext, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const MAX_COMPARE_ITEMS = 4;

  useEffect(() => {
    const savedCompare = localStorage.getItem('compareItems');
    if (savedCompare) {
      setCompareItems(JSON.parse(savedCompare));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product) => {
    if (compareItems.some(item => item.id === product.id)) {
      return { success: false, message: 'Товар уже в сравнении' };
    }
    
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return { success: false, message: `Можно сравнить не более ${MAX_COMPARE_ITEMS} товаров` };
    }
    
    setCompareItems(prev => [...prev, product]);
    return { success: true, message: 'Товар добавлен в сравнение' };
  };

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId) => {
    return compareItems.some(item => item.id === productId);
  };

  const value = {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    MAX_COMPARE_ITEMS
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};