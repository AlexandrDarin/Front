import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>TechStore</h4>
            <p>Современные технологии для вашего дома</p>
          </div>
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Email: info@techstore.ru</p>
            <p>Телефон: +7 (999) 123-45-67</p>
          </div>
          <div className="footer-section">
            <h4>Информация</h4>
            <Link to="/about">О нас</Link>
            <Link to="/delivery">Доставка</Link>
            <Link to="/payment">Оплата</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 TechStore. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
