import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState({
    name: '',
    description: '',
    is_public: false,
  });
  
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadAvailableExercises();
    if (id) {
      loadWorkoutForEdit();
      setIsEditing(true);
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [id]);

  const loadAvailableExercises = async () => {
    try {
      const response = await exerciseService.getExercises();
      setAvailableExercises(response.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadWorkoutForEdit = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkout(id);
      
      setWorkout({
        name: response.workout.name,
        description: response.workout.description || '',
        is_public: response.workout.is_public || false,
      });
      
      const workoutExercises = response.workout.Exercises || [];
      const formattedExercises = workoutExercises.map(exercise => ({
        ...exercise,
        WorkoutExercise: {
          sets: exercise.WorkoutExercise?.sets || 3,
          reps: exercise.WorkoutExercise?.reps || '10-12',
          order: exercise.WorkoutExercise?.order || 0,
          notes: exercise.WorkoutExercise?.notes || '',
        }
      }));
      
      setExercises(formattedExercises);
    } catch (error) {
      setError('Ошибка при загрузке тренировки: ' + error.message);
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutChange = (field, value) => {
    setWorkout(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      WorkoutExercise: {
        sets: 3,
        reps: '10-12',
        order: exercises.length,
        notes: '',
      }
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const handleRemoveExercise = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises(prev => prev.map((exercise, i) => {
      if (i === index) {
        if (field.startsWith('WorkoutExercise.')) {
          const workoutField = field.replace('WorkoutExercise.', '');
          return {
            ...exercise,
            WorkoutExercise: {
              ...exercise.WorkoutExercise,
              [workoutField]: value
            }
          };
        }
        return {
          ...exercise,
          [field]: value
        };
      }
      return exercise;
    }));
  };

  const handleSaveWorkout = async () => {
    if (!workout.name.trim()) {
      setError('Название тренировки обязательно');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const workoutData = {
        name: workout.name,
        description: workout.description,
        is_public: workout.is_public,
        exercises: exercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: parseInt(exercise.WorkoutExercise.sets) || 3,
          reps: exercise.WorkoutExercise.reps || '10-12',
          order: index,
          notes: exercise.WorkoutExercise.notes || '',
        }))
      };

      let response;
      if (isEditing) {
        response = await workoutService.updateWorkout(id, workoutData);
      } else {
        response = await workoutService.createWorkout(workoutData);
      }

      if (response && response.message) {
        navigate('/workouts');
      } else {
        throw new Error('Не получили ответ от сервера');
      }

    } catch (error) {
      console.error('Error saving workout:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при сохранении тренировки';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={isMobile ? styles.mobileHeader : styles.header}>
        <h1 style={isMobile ? styles.mobilePageTitle : styles.pageTitle}>
          {isEditing ? 'Редактирование тренировки' : 'Создание тренировки'}
        </h1>
        <div style={isMobile ? styles.mobileActions : styles.actions}>
          <button 
            onClick={() => navigate('/workouts')}
            style={isMobile ? styles.mobileCancelButton : styles.cancelButton}
          >
            Отмена
          </button>
          <button 
            onClick={handleSaveWorkout}
            disabled={loading}
            style={isMobile ? styles.mobileSaveButton : styles.saveButton}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {error && (
        <div style={isMobile ? styles.mobileError : styles.error}>
          <span style={isMobile ? styles.mobileErrorText : styles.errorText}>
            {error}
          </span>
          <button onClick={() => setError('')} style={styles.closeError}>×</button>
        </div>
      )}

      <div style={isMobile ? styles.mobileContent : styles.content}>
        {/* Основная информация о тренировке */}
        <div style={isMobile ? styles.mobileWorkoutInfo : styles.workoutInfo}>
          <div style={styles.inputGroup}>
            <label style={isMobile ? styles.mobileLabel : styles.label}>
              Название тренировки *
            </label>
            <input
              type="text"
              value={workout.name}
              onChange={(e) => handleWorkoutChange('name', e.target.value)}
              placeholder="Например: Тренировка груди и трицепса"
              style={isMobile ? styles.mobileInput : styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={isMobile ? styles.mobileLabel : styles.label}>
              Описание
            </label>
            <textarea
              value={workout.description}
              onChange={(e) => handleWorkoutChange('description', e.target.value)}
              placeholder="Опишите вашу тренировку..."
              style={isMobile ? styles.mobileTextarea : styles.textarea}
              rows={isMobile ? "2" : "3"}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={isMobile ? styles.mobileCheckboxLabel : styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={workout.is_public}
                onChange={(e) => handleWorkoutChange('is_public', e.target.checked)}
                style={styles.checkbox}
              />
              Сделать тренировку публичной
            </label>
            <small style={isMobile ? styles.mobileHelperText : styles.helperText}>
              Публичные тренировки видны другим пользователям
            </small>
          </div>
        </div>

        {/* Добавление упражнений */}
        <div style={isMobile ? styles.mobileExercisesSection : styles.exercisesSection}>
          <h2 style={isMobile ? styles.mobileSectionTitle : styles.sectionTitle}>
            Упражнения в тренировке ({exercises.length})
          </h2>
          
          <div style={styles.exerciseSelector}>
            <h3 style={isMobile ? styles.mobileSubtitle : styles.subtitle}>
              Добавить упражнение
            </h3>
            <div style={isMobile ? styles.mobileAvailableExercises : styles.availableExercises}>
              {availableExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise)}
                  style={{
                    ...(isMobile ? styles.mobileExerciseButton : styles.exerciseButton),
                    ...(exercises.some(ex => ex.id === exercise.id) 
                      ? (isMobile ? styles.mobileExerciseButtonDisabled : styles.exerciseButtonDisabled)
                      : {})
                  }}
                  disabled={exercises.some(ex => ex.id === exercise.id)}
                >
                  {isMobile ? (
                    <span style={styles.mobileExerciseButtonText}>
                      {exercise.name.length > 20 
                        ? exercise.name.substring(0, 20) + '...' 
                        : exercise.name}
                      {exercises.some(ex => ex.id === exercise.id) && ' ✓'}
                    </span>
                  ) : (
                    <>
                      {exercise.name}
                      {exercises.some(ex => ex.id === exercise.id) && ' ✓'}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Список добавленных упражнений */}
          <div style={isMobile ? styles.mobileAddedExercises : styles.addedExercises}>
            {exercises.length === 0 ? (
              <div style={isMobile ? styles.mobileEmptyExercises : styles.emptyExercises}>
                <p style={isMobile ? styles.mobileEmptyText : styles.emptyText}>
                  Добавьте упражнения в вашу тренировку
                </p>
              </div>
            ) : (
              exercises.map((exercise, index) => (
                <div key={index} style={isMobile ? styles.mobileExerciseItem : styles.exerciseItem}>
                  <div style={isMobile ? styles.mobileExerciseHeader : styles.exerciseHeader}>
                    <h4 style={isMobile ? styles.mobileExerciseName : styles.exerciseName}>
                      {exercise.name}
                    </h4>
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      style={isMobile ? styles.mobileRemoveButton : styles.removeButton}
                      aria-label="Удалить упражнение"
                    >
                      ×
                    </button>
                  </div>

                  <div style={isMobile ? styles.mobileExerciseParams : styles.exerciseParams}>
                    <div style={styles.paramGroup}>
                      <label style={isMobile ? styles.mobileParamLabel : styles.paramLabel}>
                        Подходы
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exercise.WorkoutExercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'WorkoutExercise.sets', parseInt(e.target.value))}
                        style={isMobile ? styles.mobileParamInput : styles.paramInput}
                      />
                    </div>

                    <div style={styles.paramGroup}>
                      <label style={isMobile ? styles.mobileParamLabel : styles.paramLabel}>
                        Повторения
                      </label>
                      <input
                        type="text"
                        value={exercise.WorkoutExercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'WorkoutExercise.reps', e.target.value)}
                        placeholder="8-12"
                        style={isMobile ? styles.mobileParamInput : styles.paramInput}
                      />
                    </div>
                  </div>

                  <div style={styles.notesGroup}>
                    <label style={isMobile ? styles.mobileParamLabel : styles.paramLabel}>
                      Заметки (вес, техника, отдых)
                    </label>
                    <input
                      type="text"
                      value={exercise.WorkoutExercise.notes}
                      onChange={(e) => handleExerciseChange(index, 'WorkoutExercise.notes', e.target.value)}
                      placeholder="Например: Отдых 60 сек между подходами"
                      style={isMobile ? styles.mobileNotesInput : styles.notesInput}
                    />
                  </div>

                  {exercise.short_description && (
                    <p style={isMobile ? styles.mobileExerciseDescription : styles.exerciseDescription}>
                      {exercise.short_description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // Общие стили
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  
  // Десктопные стили
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem 2rem 1rem',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: 'white',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.75rem',
    color: '#202124',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    minHeight: '44px',
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    minHeight: '44px',
  },
  error: {
    backgroundColor: '#ffe6e6',
    color: '#d32f2f',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '0.95rem',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  workoutInfo: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  exercisesSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  // Мобильные стили
  mobileHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem 1rem 1rem',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: 'white',
  },
  mobilePageTitle: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#202124',
    fontWeight: '600',
    textAlign: 'center',
  },
  mobileActions: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
  },
  mobileCancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    flex: 1,
    minHeight: '44px',
  },
  mobileSaveButton: {
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    flex: 1,
    minHeight: '44px',
  },
  mobileError: {
    backgroundColor: '#ffe6e6',
    color: '#d32f2f',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  mobileErrorText: {
    fontSize: '0.85rem',
    flex: 1,
    paddingRight: '0.5rem',
  },
  mobileContent: {
    padding: '1rem',
  },
  mobileWorkoutInfo: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
  },
  mobileExercisesSection: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  // Общие элементы форм
  inputGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
    color: '#202124',
    fontWeight: '500',
  },
  mobileLabel: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    color: '#202124',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  mobileInput: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  mobileTextarea: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  
  // Чекбокс
  checkboxGroup: {
    marginBottom: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  mobileCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  checkbox: {
    margin: 0,
    width: '18px',
    height: '18px',
  },
  helperText: {
    color: '#6c757d',
    fontSize: '0.85rem',
    marginLeft: '1.75rem',
    marginTop: '0.25rem',
    display: 'block',
  },
  mobileHelperText: {
    color: '#6c757d',
    fontSize: '0.8rem',
    marginLeft: '1.5rem',
    marginTop: '0.25rem',
    display: 'block',
  },
  
  // Секции и заголовки
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    color: '#202124',
  },
  mobileSectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#202124',
  },
  subtitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    color: '#202124',
  },
  mobileSubtitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    color: '#202124',
  },
  
  // Кнопки упражнений
  exerciseSelector: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e9ecef',
  },
  availableExercises: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  mobileAvailableExercises: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.5rem',
  },
  exerciseButton: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.5rem 0.75rem',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    minHeight: '36px',
  },
  mobileExerciseButton: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.4rem 0.6rem',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    minHeight: '32px',
    flex: '1 0 auto',
    maxWidth: 'calc(50% - 0.4rem)',
  },
  mobileExerciseButtonText: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exerciseButtonDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #6c757d',
    cursor: 'not-allowed',
  },
  mobileExerciseButtonDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #6c757d',
    cursor: 'not-allowed',
  },
  
  // Список добавленных упражнений
  addedExercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mobileAddedExercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyExercises: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  mobileEmptyExercises: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  emptyText: {
    margin: 0,
    fontSize: '0.95rem',
  },
  mobileEmptyText: {
    margin: 0,
    fontSize: '0.9rem',
  },
  
  // Карточка упражнения
  exerciseItem: {
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '1.25rem',
    backgroundColor: '#f8f9fa',
  },
  mobileExerciseItem: {
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  mobileExerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  exerciseName: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#202124',
    fontWeight: '600',
    flex: 1,
  },
  mobileExerciseName: {
    margin: 0,
    fontSize: '1rem',
    color: '#202124',
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: '0.5rem',
  },
  mobileRemoveButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: '0.5rem',
  },
  
  // Параметры упражнения
  exerciseParams: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  mobileExerciseParams: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  paramGroup: {
    flex: 1,
  },
  paramLabel: {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.85rem',
    color: '#5f6368',
    fontWeight: '500',
  },
  mobileParamLabel: {
    display: 'block',
    marginBottom: '0.2rem',
    fontSize: '0.8rem',
    color: '#5f6368',
    fontWeight: '500',
  },
  paramInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  mobileParamInput: {
    width: '100%',
    padding: '0.4rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  
  // Заметки
  notesGroup: {
    marginBottom: '0.5rem',
  },
  notesInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  mobileNotesInput: {
    width: '100%',
    padding: '0.4rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  
  // Описание упражнения
  exerciseDescription: {
    margin: '0.5rem 0 0 0',
    color: '#6c757d',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  mobileExerciseDescription: {
    margin: '0.4rem 0 0 0',
    color: '#6c757d',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  
  // Общие
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#d32f2f',
    padding: '0 0.5rem',
    flexShrink: 0,
  },
};

// Добавляем hover эффекты только для десктопа
if (typeof window !== 'undefined') {
  styles.cancelButton[':hover'] = { backgroundColor: '#5a6268' };
  styles.saveButton[':hover'] = { backgroundColor: '#1557b0' };
  styles.exerciseButton[':hover'] = { 
    backgroundColor: '#1a73e8',
    color: 'white'
  };
  styles.removeButton[':hover'] = { backgroundColor: '#c82333' };
  styles.mobileCancelButton[':hover'] = { backgroundColor: '#5a6268' };
  styles.mobileSaveButton[':hover'] = { backgroundColor: '#1557b0' };
  styles.mobileRemoveButton[':hover'] = { backgroundColor: '#c82333' };
}

export default WorkoutBuilder;