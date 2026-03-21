import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.scss';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main container">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;