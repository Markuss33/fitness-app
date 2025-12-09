import React from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div style={styles.container}>
      <div style={styles.welcomeSection}>
        <h1>Добро пожаловать в конструктор тренировок! 💪</h1>
        <p style={styles.subtitle}>Создавайте, планируйте и отслеживайте ваши тренировки</p>
      </div>
      
      <div style={styles.quickActions}>
        <h2>Быстрый старт</h2>
        <div style={styles.actionsGrid}>
          <Link to="/workout-builder" style={styles.actionLink}>
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>➕</div>
              <h3>Создать тренировку</h3>
              <p>Используйте конструктор для создания новой тренировки</p>
            </div>
          </Link>
          
          <Link to="/workouts" style={styles.actionLink}>
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>📋</div>
              <h3>Мои тренировки</h3>
              <p>Просмотр и управление вашими тренировками</p>
            </div>
          </Link>
          
          <Link to="/exercises" style={styles.actionLink}>
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>💪</div>
              <h3>Библиотека упражнений</h3>
              <p>Изучите все доступные упражнения</p>
            </div>
          </Link>

          <Link to="/public-workouts" style={styles.actionLink}>
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>🌐</div>
              <h3>Общедоступные тренировки</h3>
              <p>Найдите вдохновение в тренировках других пользователей</p>
            </div>
          </Link>
        </div>
      </div>

      <div style={styles.features}>
        <h2>Возможности приложения</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.feature}>
            <h4>🎯 Персональный подход</h4>
            <p>Создавайте тренировки, которые подходят именно вам</p>
          </div>
          <div style={styles.feature}>
            <h4>📊 Удобное планирование</h4>
            <p>Добавляйте подходы, повторения и заметки к каждому упражнению</p>
          </div>
          <div style={styles.feature}>
            <h4>📱 Всегда под рукой</h4>
            <p>Доступ к вашим тренировкам с любого устройства</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)',
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#5f6368',
    marginTop: '1rem',
  },
  quickActions: {
    marginBottom: '3rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  actionLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  actionIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  features: {
    marginBottom: '2rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  feature: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
};

// Добавляем hover эффект
styles.actionCard[':hover'] = styles.actionCardHover;

export default Profile;