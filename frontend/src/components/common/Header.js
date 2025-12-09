import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Проверяем при загрузке
    checkMobile();
    
    // Добавляем слушатель изменения размера
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path ? styles.activeLink : {};
  };

  // Функция для получения инициалов пользователя
  const getUserInitials = () => {
    if (!user.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // На сервере или пока компонент не загрузился, рендерим десктопную версию
  if (!mounted) {
    return (
      <header style={styles.header}>
        <div style={styles.logo}>
          <Link to="/" style={styles.logoLink}>
            💪 Конструктор тренировок
          </Link>
        </div>
      </header>
    );
  }

  // Мобильный хедер
  if (isMobile) {
    return (
      <>
        <header style={styles.mobileHeader}>
          <div style={styles.mobileHeaderContent}>
            <span style={styles.headerTitle}>Конструктор тренировок</span>
            <button 
              style={styles.menuButton}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Открыть меню"
            >
              ☰
            </button>
          </div>
        </header>

        {/* Боковое меню для мобильных */}
        {isMenuOpen && (
          <>
            <div 
              style={styles.mobileMenuOverlay} 
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрыть меню"
            />
            <div style={styles.mobileMenu}>
              <div style={styles.mobileMenuHeader}>
                <div style={styles.mobileUserInfo}>
                  <div style={styles.avatar}>
                    {getUserInitials()}
                  </div>
                  <span style={styles.mobileUserName}>{user.name}</span>
                </div>
                <button 
                  style={styles.closeButton}
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
              
              <nav style={styles.mobileNav}>
                <Link 
                  to="/" 
                  style={{ ...styles.mobileNavLink, ...isActive('/') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Главная
                </Link>
                <Link 
                  to="/workouts" 
                  style={{ ...styles.mobileNavLink, ...isActive('/workouts') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Мои тренировки
                </Link>
                <Link 
                  to="/exercises" 
                  style={{ ...styles.mobileNavLink, ...isActive('/exercises') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Упражнения
                </Link>
                <Link 
                  to="/workout-builder" 
                  style={{ ...styles.mobileNavLink, ...isActive('/workout-builder') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Создать тренировку
                </Link>
                <Link 
                  to="/public-workouts" 
                  style={{ ...styles.mobileNavLink, ...isActive('/public-workouts') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Общедоступные
                </Link>
                <Link 
                  to="/profile" 
                  style={{ ...styles.mobileNavLink, ...isActive('/profile') }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
              </nav>
              
              <div style={styles.mobileMenuFooter}>
                <button onClick={logout} style={styles.mobileLogoutButton}>
                  Выйти
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Десктопный хедер
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>
          💪 Конструктор тренировок
        </Link>
      </div>
      
      <nav style={styles.nav}>
        <Link 
          to="/" 
          style={{ ...styles.navLink, ...isActive('/') }}
        >
          Главная
        </Link>
        <Link 
          to="/workouts" 
          style={{ ...styles.navLink, ...isActive('/workouts') }}
        >
          Мои тренировки
        </Link>
        <Link 
          to="/exercises" 
          style={{ ...styles.navLink, ...isActive('/exercises') }}
        >
          Упражнения
        </Link>
        <Link 
          to="/workout-builder" 
          style={{ ...styles.navLink, ...isActive('/workout-builder') }}
        >
          Создать тренировку
        </Link>
        <Link 
          to="/public-workouts" 
          style={{ ...styles.navLink, ...isActive('/public-workouts') }}
        >
          Общедоступные
        </Link>
      </nav>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <Link to="/profile" style={styles.userLink}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {getUserInitials()}
              </div>
              <span style={styles.userName}>{user.name}</span>
            </div>
          </Link>
          <button onClick={logout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

const styles = {
  // Стили для десктопной версии
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    flex: 1,
  },
  logoLink: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1a73e8',
    textDecoration: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  logoLinkHover: {
    backgroundColor: '#f8f9fa',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    flex: 2,
    justifyContent: 'center',
  },
  navLink: {
    color: '#5f6368',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
  navLinkHover: {
    backgroundColor: '#f8f9fa',
    color: '#1a73e8',
  },
  activeLink: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
  },
  userSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userLink: {
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  userLinkHover: {
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '6px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '500',
    color: '#202124',
    fontSize: '0.95rem',
  },
  logoutButton: {
    backgroundColor: '#f8f9fa',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  logoutButtonHover: {
    backgroundColor: '#dc3545',
    color: 'white',
  },

  // Стили для мобильной версии
  mobileHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
  },
  mobileHeaderContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    height: '60px',
    boxSizing: 'border-box',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a73e8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuButton: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#333',
    minWidth: '44px',
    minHeight: '44px',
  },
  mobileMenuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '80%',
    maxWidth: '300px',
    height: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  mobileUserName: {
    fontWeight: '500',
    color: '#202124',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#333',
    minWidth: '44px',
    minHeight: '44px',
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
    flex: 1,
    overflowY: 'auto',
  },
  mobileNavLink: {
    color: '#5f6368',
    textDecoration: 'none',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.2s',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
  },
  mobileNavLinkHover: {
    backgroundColor: '#f8f9fa',
  },
  mobileMenuFooter: {
    padding: '1rem',
    borderTop: '1px solid #eee',
  },
  mobileLogoutButton: {
    backgroundColor: '#f8f9fa',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    width: '100%',
    borderRadius: '6px',
    minHeight: '44px',
  },
};

// Добавляем hover эффекты для десктопа
if (typeof window !== 'undefined') {
  styles.logoLink[':hover'] = styles.logoLinkHover;
  styles.navLink[':hover'] = styles.navLinkHover;
  styles.userLink[':hover'] = styles.userLinkHover;
  styles.logoutButton[':hover'] = styles.logoutButtonHover;
  styles.mobileNavLink[':hover'] = styles.mobileNavLinkHover;
}

export default Header;