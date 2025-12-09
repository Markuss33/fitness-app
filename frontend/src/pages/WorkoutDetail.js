import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { useModal } from '../hooks/useModal'; // 🔥 ДОБАВЛЯЕМ ИМПОРТ ХУКА

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔥 ИСПОЛЬЗУЕМ НАШ ХУК ДЛЯ МОДАЛЬНЫХ ОКОН
  const { 
    ModalComponent, 
    confirm 
  } = useModal();

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkout(id);
      setWorkout(response.workout);
    } catch (error) {
      setError('Тренировка не найдена');
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ДОБАВЛЯЕМ ФУНКЦИЮ ДЛЯ ПЕРЕЗАГРУЗКИ ДАННЫХ
  const refreshWorkout = async () => {
    try {
      const response = await workoutService.getWorkout(id);
      setWorkout(response.workout);
    } catch (error) {
      console.error('Error refreshing workout:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/workout-builder/${id}`);
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Удаление тренировки',
      message: 'Вы уверены, что хотите удалить эту тренировку? Это действие нельзя отменить.',
      type: 'danger',
      confirmText: 'Да, удалить',
      cancelText: 'Отмена'
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await workoutService.deleteWorkout(id);
      navigate('/workouts');
    } catch (error) {
      setError('Ошибка при удалении тренировки');
      console.error('Error deleting workout:', error);
    }
  };

  useEffect(() => {
    const handleWorkoutUpdated = () => {
      refreshWorkout();
    };

    // Можно добавить event listener или использовать другой способ
    // Для простоты просто перезагружаем при каждом монтировании
    // или добавим кнопку "Обновить"
    
    return () => {
      // Cleanup при размонтировании
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка тренировки...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
          <button onClick={() => navigate('/workouts')} style={styles.backButton}>
            Назад к тренировкам
          </button>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Тренировка не найдена
          <button onClick={() => navigate('/workouts')} style={styles.backButton}>
            Назад к тренировкам
          </button>
        </div>
      </div>
    );
  }

  return (
    // 🔥 ДОБАВЛЯЕМ ModalComponent В РЕНДЕР
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate('/workouts')} style={styles.backButton}>
            ← Назад к тренировкам
          </button>
          <div style={styles.headerActions}>
            <button onClick={handleEdit} style={styles.editButton}>
              Редактировать
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              Удалить
            </button>
          </div>
        </div>

        <div style={styles.workoutInfo}>
          <h1 style={styles.workoutTitle}>{workout.name}</h1>
          {workout.description && (
            <p style={styles.workoutDescription}>{workout.description}</p>
          )}
          <div style={styles.workoutMeta}>
            <span style={styles.exerciseCount}>
              💪 {workout.Exercises?.length || 0} упражнений
            </span>
            {workout.is_public && (
              <span style={styles.publicBadge}>🌐 Публичная тренировка</span>
            )}
          </div>
        </div>

        <div style={styles.exercisesSection}>
          <h2 style={styles.sectionTitle}>Упражнения в тренировке</h2>
          
          {workout.Exercises && workout.Exercises.length > 0 ? (
            <div style={styles.exercisesList}>
              {workout.Exercises.map((exercise, index) => (
                <Link 
                  key={exercise.id} 
                  to={`/exercises/${exercise.id}`}
                  style={styles.exerciseCardLink}
                >
                  <div style={styles.exerciseCard} className="exercise-card">
                    <div style={styles.exerciseHeader}>
                      <h3 style={styles.exerciseName}>{exercise.name}</h3>
                      <span style={styles.exerciseOrder}>#{index + 1}</span>
                    </div>
                    
                    <div style={styles.exerciseDetails}>
                      <div style={styles.detailsRow}>
                        {exercise.WorkoutExercise?.sets && (
                          <div style={styles.detailItem}>
                            <strong>Подходы:</strong> {exercise.WorkoutExercise.sets}
                          </div>
                        )}
                        {exercise.WorkoutExercise?.reps && (
                          <div style={styles.detailItem}>
                            <strong>Повторения:</strong> {exercise.WorkoutExercise.reps}
                          </div>
                        )}
                      </div>
                      
                      {exercise.WorkoutExercise?.notes && (
                        <div style={styles.notesContainer}>
                          <strong style={styles.notesLabel}>Заметки:</strong>
                          <div style={styles.notesContent}>
                            {exercise.WorkoutExercise.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={styles.clickHint}>
                      👆 Нажмите для деталей упражнения
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={styles.emptyExercises}>
              <p>В этой тренировке пока нет упражнений</p>
              <button onClick={handleEdit} style={styles.addExercisesButton}>
                Добавить упражнения
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 РЕНДЕРИМ МОДАЛЬНОЕ ОКНО */}
      <ModalComponent />
    </>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#1a73e8',
      color: 'white',
    },
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#218838',
    },
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1557b0',
    },
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#c82333',
    },
  },
  workoutInfo: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '2rem',
    marginBottom: '2rem',
  },
  workoutTitle: {
    margin: '0 0 1rem 0',
    fontSize: '2rem',
    color: '#202124',
  },
  workoutDescription: {
    margin: '0 0 1.5rem 0',
    color: '#5f6368',
    fontSize: '1.1rem',
    lineHeight: '1.6',
  },
  workoutMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: '1rem',
    color: '#80868b',
    fontWeight: '500',
  },
  publicBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  exercisesSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#202124',
  },
  // 🔥 ИЗМЕНЯЕМ НА ВЕРТИКАЛЬНЫЙ СПИСОК ВМЕСТО СЕТКИ
  exercisesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  exerciseCardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  // 🔥 УБИРАЕМ ФИКСИРОВАННУЮ ВЫСОТУ И ДЕЛАЕМ АДАПТИВНОЙ
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid transparent',
    position: 'relative',
    overflow: 'hidden',
    transform: 'scale(1)',
    minHeight: '120px', // Минимальная высота
    ':hover': {
      transform: 'scale(1.01)',
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
  exerciseOrder: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginLeft: '0.5rem',
  },
  exerciseDetails: {
    flex: 1,
    marginBottom: '1rem',
  },
  // 🔥 ДОБАВЛЯЕМ ГОРИЗОНТАЛЬНОЕ РАСПОЛОЖЕНИЕ ДЛЯ ПОДХОДОВ И ПОВТОРЕНИЙ
  detailsRow: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
  },
  detailItem: {
    fontSize: '0.9rem',
    color: '#5f6368',
    whiteSpace: 'nowrap',
  },
  // 🔥 ОТДЕЛЬНЫЙ КОНТЕЙНЕР ДЛЯ ЗАМЕТОК С ПЕРЕНАСЫВАЕМЫМ ТЕКСТОМ
  notesContainer: {
    marginTop: '0.5rem',
  },
  notesLabel: {
    fontSize: '0.9rem',
    color: '#5f6368',
    display: 'block',
    marginBottom: '0.25rem',
  },
  notesContent: {
    fontSize: '0.9rem',
    color: '#202124',
    lineHeight: '1.4',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  clickHint: {
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    color: '#1a73e8',
    fontSize: '0.85rem',
    fontWeight: '500',
    marginTop: 'auto',
    transition: 'background-color 0.2s ease',
  },
  emptyExercises: {
    textAlign: 'center',
    padding: '3rem',
    color: '#80868b',
  },
  addExercisesButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1557b0',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: '#dc3545',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
};

// Добавляем CSS для плавных анимаций
const additionalStyles = `
  .exercise-card {
    transition: all 0.2s ease-in-out !important;
    transform: scale(1);
  }
  
  .exercise-card:hover {
    transform: scale(1.01) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    border-color: #1a73e8 !important;
  }
  
  .exercise-card:hover .click-hint {
    background-color: #e8f0fe !important;
  }

  /* Стили для скроллбара в заметках */
  .notes-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .notes-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .notes-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .notes-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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
    transform: 'scale(1.01)',
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

// 🔥 ДОБАВЛЯЕМ КЛАСС ДЛЯ СКРОЛЛБАРА
styles.notesContent = {
  ...styles.notesContent,
  className: 'notes-content',
};

export default WorkoutDetail;