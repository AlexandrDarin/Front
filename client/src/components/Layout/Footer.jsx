import React from 'react';
import './Layout.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__grid">
                    <div className="footer__col">
                        <h4>TechStore</h4>
                        <ul>
                            <li>О компании</li>
                            <li>Контакты</li>
                            <li>Вакансии</li>
                        </ul>
                    </div>
                    <div className="footer__col">
                        <h4>Покупателям</h4>
                        <ul>
                            <li>Доставка</li>
                            <li>Оплата</li>
                            <li>Гарантия</li>
                        </ul>
                    </div>
                    <div className="footer__col">
                        <h4>Мы в соцсетях</h4>
                        <ul>
                            <li>Telegram</li>
                            <li>VK</li>
                            <li>YouTube</li>
                        </ul>
                    </div>
                </div>
                <div className="footer__bottom">
                    © {new Date().getFullYear()} TechStore. Все права защищены.
                </div>
            </div>
        </footer>
    );
};

export default Footer;