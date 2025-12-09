import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exerciseService } from '../services/exerciseService';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await exerciseService.getExercises();
      setExercises(response.exercises);
    } catch (error) {
      setError('Ошибка при загрузке упражнений');
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка упражнений...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Библиотека упражнений</h1>
        <p style={styles.subtitle}>
          Все доступные упражнения для ваших тренировок
        </p>
      </header>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError('')} style={styles.closeError}>×</button>
        </div>
      )}

      <div style={styles.exercisesGrid}>
        {exercises.map(exercise => (
          <Link 
            key={exercise.id} 
            to={`/exercises/${exercise.id}`}
            style={styles.exerciseCardLink}
          >
            <div style={styles.exerciseCard} className="exercise-card">
              <div style={styles.exerciseHeader}>
                <h3 style={styles.exerciseName}>{exercise.name}</h3>
                {exercise.is_custom && (
                  <span style={styles.customBadge}>Пользовательское</span>
                )}
              </div>
              
              {exercise.short_description && (
                <p style={styles.exerciseDescription}>
                  {exercise.short_description.length > 120 
                    ? `${exercise.short_description.substring(0, 120)}...` 
                    : exercise.short_description
                  }
                </p>
              )}
              
              <div style={styles.exerciseMeta}>
                <div style={styles.mediaIndicator}>
                  {exercise.image_url && (
                    <span style={styles.mediaIcon}></span>
                  )}
                  {exercise.video_url && (
                    <span style={styles.mediaIcon}></span>
                  )}
                </div>
                <div style={styles.clickHint}>
                  👆 Нажмите для деталей
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  subtitle: {
    color: '#5f6368',
    fontSize: '1.1rem',
    marginTop: '0.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#ffe6e6',
    color: '#d32f2f',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#d32f2f',
  },
  exercisesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  exerciseCardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  exerciseCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid transparent',
    position: 'relative',
    overflow: 'hidden',
    transform: 'scale(1)',
    ':hover': {
      transform: 'scale(1.03)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      borderColor: '#1a73e8',
    },
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  exerciseName: {
    margin: '0',
    fontSize: '1.125rem',
    color: '#202124',
    flex: 1,
  },
  customBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginLeft: '0.5rem',
    whiteSpace: 'nowrap',
  },
  exerciseDescription: {
    margin: '0 0 1rem 0',
    color: '#5f6368',
    lineHeight: '1.5',
    fontSize: '0.9rem',
    flex: 1,
  },
  exerciseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #f0f0f0',
  },
  mediaIndicator: {
    display: 'flex',
    gap: '0.5rem',
  },
  mediaIcon: {
    fontSize: '0.9rem',
    opacity: '0.7',
  },
  clickHint: {
    color: '#1a73e8',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
};

// Добавляем CSS для плавных анимаций
const additionalStyles = `
  .exercise-card {
    transition: all 0.2s ease-in-out !important;
    transform: scale(1);
  }
  
  .exercise-card:hover {
    transform: scale(1.03) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    border-color: #1a73e8 !important;
  }
  
  .exercise-card:hover .click-hint {
    color: #1557b0 !important;
  }
`;

// Вставляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.innerText = additionalStyles;
document.head.appendChild(styleSheet);

// Обновляем стили для hover эффектов
styles.exerciseCard = {
  ...styles.exerciseCard,
  ':hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    borderColor: '#1a73e8',
  },
};

styles.clickHint = {
  ...styles.clickHint,
  className: 'click-hint',
  ':hover': {
    color: '#1557b0',
  },
};

export default Exercises;