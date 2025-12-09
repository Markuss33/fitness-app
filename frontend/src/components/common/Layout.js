import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  console.log('Layout component is rendering!'); // Отладочное сообщение
  
  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  main: {
    minHeight: '100vh',
    paddingTop: '80px', // Добавляем отступ для фиксированного header
  },
};

export default Layout;