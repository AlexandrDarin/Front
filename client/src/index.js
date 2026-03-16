import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// Регистрация service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered: ', registration);
        
        // Запрашиваем разрешение на уведомления
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Проверка соединения
window.addEventListener('online', () => {
  console.log('You are online');
  // Можно показать уведомление
});

window.addEventListener('offline', () => {
  console.log('You are offline');
  // Можно показать уведомление
});