import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';

const PublicWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicWorkouts();
  }, []);

  const loadPublicWorkouts = async () => {
    try {
      setLoading(true);
      console.log('Loading public workouts from:', '/workouts/public/list');
      
      const response = await workoutService.getPublicWorkouts();
      console.log('Public workouts response:', response);
      
      setWorkouts(response.workouts || []);
    } catch (error) {
      console.error('Error loading public workouts:', error);
      console.error('Error details:', error.response?.data);
      setError('Ошибка при загрузке публичных тренировок: ' + 
        (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (workoutId) => {
    navigate(`/public-workouts/${workoutId}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>Загрузка публичных тренировок...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📚 Публичные тренировки</h1>
        <p>Тренировки, которыми поделились другие пользователи</p>
        <Link to="/workouts" style={styles.backLink}>
          ← Назад к моим тренировкам
        </Link>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {workouts.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>😔 Публичных тренировок пока нет</h3>
          <p>Будьте первым, кто поделится своей тренировкой!</p>
          <Link to="/workout-builder" style={styles.createLink}>
            ➕ Создать тренировку
          </Link>
        </div>
) : (
        <div style={styles.workoutsGrid}>
          {workouts.map(workout => (
            <Link 
              key={workout.id} 
              to={`/public-workouts/${workout.id}`}
              style={styles.workoutCardLink}
            >
              <div style={styles.workoutCard} className="workout-card">
                <div style={styles.workoutHeader}>
                  <h3 style={styles.workoutName}>{workout.name}</h3>
                  <div style={styles.workoutMeta}>
                    <span style={styles.creator}>
                      👤 {workout.User?.name || 'Неизвестный пользователь'}
                    </span>
                    <span style={styles.exerciseCount}>
                      💪 {workout.Exercises?.length || 0} упражнений
                    </span>
                  </div>
                </div>

                {workout.description && (
                  <p style={styles.description}>{workout.description}</p>
                )}

                <div style={styles.exercisesPreview}>
                  <strong>Упражнения:</strong>
                  {workout.Exercises && workout.Exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} style={styles.exerciseItem}>
                      • {exercise.name} 
                      {exercise.WorkoutExercise?.sets && ` - ${exercise.WorkoutExercise.sets}×${exercise.WorkoutExercise.reps}`}
                    </div>
                  ))}
                  {workout.Exercises && workout.Exercises.length > 3 && (
                    <div style={styles.moreExercises}>
                      ... и еще {workout.Exercises.length - 3} упражнений
                    </div>
                  )}
                </div>

                <div style={styles.clickHint}>
                  👆 Нажмите, чтобы посмотреть детали
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
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
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  backLink: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontSize: '1rem',
    marginTop: '1rem',
    display: 'inline-block',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  createLink: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1557b0',
    },
  },
  workoutsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  workoutCard: {
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
    // Базовые стили для плавной анимации
    transform: 'scale(1)',
    ':hover': {
      transform: 'scale(1.03)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      borderColor: '#1a73e8',
    },
  },
  workoutHeader: {
    marginBottom: '1rem',
  },
  workoutName: {
    margin: '0 0 0.5rem 0',
    color: '#333',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  workoutMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#666',
  },
  creator: {
    fontSize: '0.85rem',
  },
  exerciseCount: {
    fontSize: '0.85rem',
  },
  description: {
    color: '#666',
    marginBottom: '1rem',
    fontSize: '0.95rem',
    lineHeight: '1.4',
  },
  exercisesPreview: {
    flex: 1,
    marginBottom: '1rem',
  },
  exerciseItem: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#555',
    padding: '0.25rem 0',
  },
  moreExercises: {
    fontSize: '0.85rem',
    color: '#888',
    fontStyle: 'italic',
    marginTop: '0.5rem',
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
  workoutCardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
};

// Добавляем CSS для плавных анимаций
const additionalStyles = `
  .workout-card {
    transition: all 0.2s ease-in-out !important;
    transform: scale(1);
  }
  
  .workout-card:hover {
    transform: scale(1.03) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    border-color: #1a73e8 !important;
  }
  
  .workout-card:hover .click-hint {
    background-color: #e8f0fe !important;
  }
`;

// Вставляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.innerText = additionalStyles;
document.head.appendChild(styleSheet);

// Обновляем стили для hover эффектов
styles.workoutCard = {
  ...styles.workoutCard,
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
    backgroundColor: '#e8f0fe',
  },
};

export default PublicWorkouts;