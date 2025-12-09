import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { useModal } from '../hooks/useModal';

const PublicWorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { 
    ModalComponent, 
    alert 
  } = useModal();

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadWorkoutDetail();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [id]);

  const loadWorkoutDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await workoutService.getPublicWorkoutDetail(id);
      setWorkout(response.workout);
    } catch (error) {
      console.error('Error loading workout:', error);
      setError('Ошибка при загрузке тренировки: ' + 
        (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    try {
      setSaving(true);
      await workoutService.savePublicWorkout(id);
      
      await alert({
        title: 'Успех!',
        message: 'Тренировка успешно сохранена в ваш профиль',
        type: 'success'
      });
      
      navigate('/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      
      await alert({
        title: 'Ошибка сохранения',
        message: 'Ошибка при сохранении тренировки: ' + 
          (error.response?.data?.message || error.message),
        type: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>Загрузка тренировки...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
          <br />
          <button onClick={() => navigate('/public-workouts')} style={styles.backButton}>
            ← Вернуться к публичным тренировкам
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
          <br />
          <button onClick={() => navigate('/public-workouts')} style={styles.backButton}>
            ← Вернуться к публичным тренировкам
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <div style={isMobile ? styles.mobileHeader : styles.header}>
          <button onClick={() => navigate('/public-workouts')} style={styles.backButton}>
            ← Назад к публичным тренировкам
          </button>
          <div style={isMobile ? styles.mobileHeaderActions : styles.headerActions}>
            <button 
              onClick={handleSaveWorkout}
              disabled={saving}
              style={isMobile ? styles.mobileSaveButton : styles.saveButton}
            >
              {saving ? 'Сохранение...' : '💾 Сохранить себе'}
            </button>
          </div>
        </div>

        <div style={isMobile ? styles.mobileWorkoutInfo : styles.workoutInfo}>
          <h1 style={isMobile ? styles.mobileWorkoutTitle : styles.workoutTitle}>{workout.name}</h1>
          {workout.description && (
            <p style={isMobile ? styles.mobileWorkoutDescription : styles.workoutDescription}>
              {workout.description}
            </p>
          )}
          <div style={isMobile ? styles.mobileWorkoutMeta : styles.workoutMeta}>
            <span style={styles.exerciseCount}>
              💪 {workout.Exercises?.length || 0} упражнений
            </span>
            <span style={styles.creator}>
              👤 Создатель: {workout.User?.name || 'Неизвестный пользователь'}
            </span>
          </div>
        </div>

        <div style={isMobile ? styles.mobileExercisesSection : styles.exercisesSection}>
          <h2 style={isMobile ? styles.mobileSectionTitle : styles.sectionTitle}>Упражнения в тренировке</h2>
          
          {workout.Exercises && workout.Exercises.length > 0 ? (
            <div style={styles.exercisesList}>
              {workout.Exercises.map((exercise, index) => (
                <Link 
                  key={exercise.id} 
                  to={`/exercises/${exercise.id}`}
                  style={styles.exerciseCardLink}
                >
                  <div style={isMobile ? styles.mobileExerciseCard : styles.exerciseCard}>
                    <div style={styles.exerciseHeader}>
                      <h3 style={isMobile ? styles.mobileExerciseName : styles.exerciseName}>
                        {exercise.name}
                      </h3>
                      <span style={styles.exerciseOrder}>#{index + 1}</span>
                    </div>
                    
                    <div style={styles.exerciseDetails}>
                      <div style={isMobile ? styles.mobileDetailsRow : styles.detailsRow}>
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
                      
                      {/* Медиа информация (только для публичных тренировок) */}
                      {(exercise.video_url || exercise.image_url) && (
                        <div style={styles.mediaInfo}>
                          {exercise.video_url && (
                            <span style={styles.mediaBadge}>📺 Видео</span>
                          )}
                          {exercise.image_url && (
                            <span style={styles.mediaBadge}>🖼️ Изображение</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={isMobile ? styles.mobileClickHint : styles.clickHint}>
                      👆 Нажмите для деталей упражнения
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={isMobile ? styles.mobileEmptyExercises : styles.emptyExercises}>
              <p>В этой тренировке пока нет упражнений</p>
            </div>
          )}
        </div>
        
        {/* Кнопка сохранения для мобильных (внизу страницы) */}
        {isMobile && (
          <div style={styles.mobileBottomActions}>
            <button 
              onClick={handleSaveWorkout}
              disabled={saving}
              style={saving ? styles.mobileSaveButtonDisabled : styles.mobileSaveButtonBottom}
            >
              {saving ? 'Сохранение...' : '💾 Сохранить эту тренировку себе'}
            </button>
          </div>
        )}
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
  // Десктопные стили
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  // Мобильные стили
  mobileHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  mobileHeaderActions: {
    display: 'flex',
    width: '100%',
  },
  // Общие стили
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
  },
  mobileSaveButton: {
    padding: '0.75rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    width: '100%',
  },
  mobileSaveButtonBottom: {
    padding: '1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    fontWeight: '500',
  },
  mobileSaveButtonDisabled: {
    padding: '1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '1rem',
    width: '100%',
    fontWeight: '500',
    opacity: 0.7,
  },
  workoutInfo: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  mobileWorkoutInfo: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem',
    marginBottom: '1rem',
  },
  workoutTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.75rem',
    color: '#202124',
  },
  mobileWorkoutTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.5rem',
    color: '#202124',
  },
  workoutDescription: {
    margin: '0 0 1.5rem 0',
    color: '#5f6368',
    fontSize: '1.1rem',
    lineHeight: '1.6',
  },
  mobileWorkoutDescription: {
    margin: '0 0 1rem 0',
    color: '#5f6368',
    fontSize: '1rem',
    lineHeight: '1.5',
  },
  workoutMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileWorkoutMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  exerciseCount: {
    fontSize: '1rem',
    color: '#80868b',
    fontWeight: '500',
  },
  creator: {
    fontSize: '0.9rem',
    color: '#5f6368',
  },
  exercisesSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '1.5rem',
  },
  mobileExercisesSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem',
  },
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#202124',
  },
  mobileSectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.3rem',
    color: '#202124',
  },
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
    minHeight: '120px',
  },
  mobileExerciseCard: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '2px solid transparent',
    position: 'relative',
    overflow: 'hidden',
    transform: 'scale(1)',
    minHeight: '100px',
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
  mobileExerciseName: {
    margin: '0',
    fontSize: '1rem',
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
  detailsRow: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
  },
  mobileDetailsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  detailItem: {
    fontSize: '0.9rem',
    color: '#5f6368',
    whiteSpace: 'nowrap',
  },
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
  mediaInfo: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  },
  mediaBadge: {
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    borderRadius: '6px',
    color: '#1a73e8',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginTop: 'auto',
  },
  emptyExercises: {
    textAlign: 'center',
    padding: '3rem',
    color: '#80868b',
  },
  mobileEmptyExercises: {
    textAlign: 'center',
    padding: '2rem',
    color: '#80868b',
    fontSize: '0.9rem',
  },
  mobileBottomActions: {
    marginTop: '1rem',
    padding: '1rem 0',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#dc3545',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
};

// Добавляем hover эффекты только для десктопа
if (typeof window !== 'undefined') {
  styles.backButton[':hover'] = {
    backgroundColor: '#1a73e8',
    color: 'white',
  };
  
  styles.saveButton[':hover'] = {
    backgroundColor: '#218838',
  };
  
  styles.mobileSaveButton[':hover'] = {
    backgroundColor: '#218838',
  };
  
  styles.mobileSaveButtonBottom[':hover'] = {
    backgroundColor: '#218838',
  };
  
  styles.exerciseCard[':hover'] = {
    transform: 'scale(1.01)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    borderColor: '#1a73e8',
  };
  
  styles.mobileExerciseCard[':hover'] = {
    transform: 'scale(1.005)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    borderColor: '#1a73e8',
  };
  
  styles.clickHint[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
  
  styles.mobileClickHint[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
}

export default PublicWorkoutDetail;