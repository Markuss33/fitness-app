import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { useModal } from '../hooks/useModal';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { 
    ModalComponent, 
    confirm, 
    alert 
  } = useModal();

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkouts();
      setWorkouts(response.workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId, e) => {
    e.stopPropagation(); // 🔥 Предотвращаем переход по ссылке при удалении
    
    const workoutToDelete = workouts.find(w => w.id === workoutId);
    const workoutName = workoutToDelete?.name || 'эту тренировку';
    
    const shouldDelete = await confirm({
      title: 'Удаление тренировки',
      message: `Вы уверены, что хотите удалить тренировку "${workoutName}"? Это действие нельзя отменить.`,
      type: 'danger',
      confirmText: 'Удалить',
      cancelText: 'Отмена'
    });

    if (!shouldDelete) {
      return;
    }

    try {
      await workoutService.deleteWorkout(workoutId);
      setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      
      await alert({
        title: 'Успех!',
        message: `Тренировка "${workoutName}" успешно удалена`,
        type: 'success'
      });
      
    } catch (error) {
      setError('Ошибка при удалении тренировки');
      console.error('Error deleting workout:', error);
      
      await alert({
        title: 'Ошибка',
        message: 'Не удалось удалить тренировку: ' + 
          (error.response?.data?.message || error.message),
        type: 'danger'
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка тренировок...</div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <div style={isMobile ? styles.mobileHeader : styles.header}>
          <h1 style={styles.pageTitle}>Мои тренировки</h1>
          <div style={isMobile ? styles.mobileButtonContainer : styles.buttonContainer}>
            <Link to="/workout-builder" style={styles.createButton}>
              + Создать тренировку
            </Link>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
            <button onClick={() => setError('')} style={styles.closeError}>×</button>
          </div>
        )}

        <div style={{
          ...styles.workoutsGrid,
          ...(isMobile ? styles.mobileWorkoutsGrid : {})
        }}>
          {workouts.length === 0 ? (
            <div style={isMobile ? styles.mobileEmptyState : styles.emptyState}>
              <h3 style={styles.emptyStateTitle}>У вас пока нет тренировок</h3>
              <p style={styles.emptyStateText}>Создайте свою первую тренировку!</p>
              <Link to="/workout-builder" style={styles.emptyStateButton}>
                Создать тренировку
              </Link>
            </div>
          ) : (
            workouts.map(workout => (
              <Link 
                key={workout.id} 
                to={`/workout/${workout.id}`}
                style={styles.workoutCardLink}
              >
                <div style={{
                  ...styles.workoutCard,
                  ...(isMobile ? styles.mobileWorkoutCard : {})
                }}>                  
                  
                  <div style={styles.workoutContent}>
                    <h3 style={isMobile ? styles.mobileWorkoutTitle : styles.workoutTitle}>
                      {workout.name}
                    </h3>
                    {workout.description && (
                      <p style={isMobile ? styles.mobileWorkoutDescription : styles.workoutDescription}>
                        {workout.description}
                      </p>
                    )}
                    <div style={isMobile ? styles.mobileWorkoutStats : styles.workoutStats}>
                      <span style={styles.exerciseCount}>
                        💪 {workout.Exercises?.length || 0} упражнений
                      </span>
                      {workout.is_public && (
                        <span style={styles.publicBadge}>🌐 Публичная</span>
                      )}
                    </div>
                    
                    {/* 🔥 ПОДСКАЗКА ДЛЯ ПОЛЬЗОВАТЕЛЯ */}
                    <div style={isMobile ? styles.mobileClickHint : styles.clickHint}>
                      👆 Нажмите, чтобы посмотреть детали
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <ModalComponent />
    </>
  );
};

const styles = {
  container: {
    padding: '1rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  // Стили для десктопной версии
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e9ecef',
  },
  buttonContainer: {
    // Пустой стиль для десктопа
  },
  // Стили для мобильной версии
  mobileHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e9ecef',
  },
  mobileButtonContainer: {
    width: '100%',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#202124',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    display: 'inline-block',
    textAlign: 'center',
    width: '100%',
    fontSize: '0.95rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#ffe6e6',
    color: '#d32f2f',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#d32f2f',
    padding: '0 0.5rem',
  },
  workoutsGrid: {
    display: 'grid',
    gap: '1rem',
  },
  // Десктопная сетка
  workoutsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  // Мобильная сетка
  mobileWorkoutsGrid: {
    gridTemplateColumns: '1fr',
    gap: '1rem',
  },
  workoutCardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid transparent',
    position: 'relative',
    overflow: 'hidden',
    transform: 'scale(1)',
  },
  mobileWorkoutCard: {
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  workoutContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  workoutTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    color: '#202124',
    fontWeight: '600',
  },
  mobileWorkoutTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    color: '#202124',
    fontWeight: '600',
  },
  workoutDescription: {
    margin: '0 0 1rem 0',
    color: '#5f6368',
    lineHeight: '1.5',
    fontSize: '0.95rem',
    flex: 1,
  },
  mobileWorkoutDescription: {
    margin: '0 0 0.75rem 0',
    color: '#5f6368',
    lineHeight: '1.4',
    fontSize: '0.9rem',
    flex: 1,
  },
  workoutStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  mobileWorkoutStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  exerciseCount: {
    fontSize: '0.875rem',
    color: '#80868b',
    fontWeight: '500',
  },
  publicBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  clickHint: {
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    color: '#1a73e8',
    fontSize: '0.85rem',
    fontWeight: '500',
    marginTop: 'auto',
    transition: 'background-color 0.2s ease',
  },
  mobileClickHint: {
    textAlign: 'center',
    padding: '0.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    color: '#1a73e8',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginTop: 'auto',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mobileEmptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyStateTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    color: '#202124',
  },
  emptyStateText: {
    margin: '0 0 1rem 0',
    color: '#5f6368',
    fontSize: '0.95rem',
  },
  emptyStateButton: {
    display: 'inline-block',
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    textDecoration: 'none',
    marginTop: '1rem',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
};

// Добавляем hover эффекты только для десктопа
if (typeof window !== 'undefined') {
  styles.createButton[':hover'] = {
    backgroundColor: '#1557b0',
  };
  
  styles.workoutCard[':hover'] = {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    borderColor: '#1a73e8',
  };
  
  styles.emptyStateButton[':hover'] = {
    backgroundColor: '#1557b0',
  };
  
  styles.clickHint[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
}

// Убираем добавление стилей через document.head
// Вместо этого используем условные стили через JS

export default Workouts;