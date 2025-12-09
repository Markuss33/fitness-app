import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseService } from '../services/exerciseService';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExercise();
  }, [id]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const response = await exerciseService.getExerciseById(id);
      setExercise(response.exercise);
    } catch (error) {
      setError('Ошибка при загрузке упражнения');
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Функция для отображения видео
  const renderVideoContent = () => {
    // Если есть embed-код, показываем его
    if (exercise?.video_embed) {
      return (
        <div style={videoStyles.wrapper}>
          <div 
            style={videoStyles.container}
            dangerouslySetInnerHTML={{ __html: exercise.video_embed }}
          />
          <div style={videoStyles.info}>
            <span style={videoStyles.note}>
              Видео загружается напрямую с VK
            </span>
          </div>
        </div>
      );
    }
    
    // Если нет embed-кода, но есть ссылка, показываем ссылку
    if (exercise?.video_url) {
      return (
        <div style={videoStyles.fallback}>
          <p style={{ marginBottom: '1rem' }}>Для просмотра видео перейдите по ссылке:</p>
          <a 
            href={exercise.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={videoStyles.fallbackLink}
          >
            📺 Смотреть видео на VK
          </a>
        </div>
      );
    }
    
    // Если нет ни embed-кода, ни ссылки
    return (
      <div style={videoStyles.fallback}>
        <p>Видео для этого упражнения отсутствует</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка упражнения...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
          <button onClick={handleBack} style={styles.backButton}>
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Упражнение не найдено
          <button onClick={handleBack} style={styles.backButton}>
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Назад к списку
        </button>
      </div>

      <div style={styles.exerciseDetail}>
        <div style={styles.exerciseHeader}>
          <h1 style={styles.exerciseTitle}>{exercise.name}</h1>
          {exercise.is_custom && (
            <span style={styles.customBadge}>Пользовательское упражнение</span>
          )}
        </div>

        {exercise.detailed_description && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Техника выполнения</h3>
            <div style={styles.description}>
              {exercise.detailed_description.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '0.5rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Видео секция - всегда отображается */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Видео выполнения</h3>
          {renderVideoContent()}
        </div>

        {/* Изображение */}
        {exercise.image_url && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Изображение</h3>
            <div style={styles.imageContainer}>
              <img 
                src={exercise.image_url} 
                alt={exercise.name}
                style={styles.exerciseImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = 
                    '<div style="padding: 2rem; text-align: center; color: #666;">Изображение не загружено</div>';
                }}
              />
            </div>
          </div>
        )}

        {/* Информация об упражнении */}
        <div style={styles.infoGrid}>
          {exercise.muscle_group && (
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Группа мышц</div>
              <div style={styles.infoValue}>{exercise.muscle_group}</div>
            </div>
          )}
          
          {exercise.difficulty && (
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Сложность</div>
              <div style={styles.infoValue}>{exercise.difficulty}</div>
            </div>
          )}
          
          {exercise.equipment && (
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Оборудование</div>
              <div style={styles.infoValue}>{exercise.equipment}</div>
            </div>
          )}
          
          {exercise.target_muscles && (
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Целевые мышцы</div>
              <div style={styles.infoValue}>{exercise.target_muscles}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Стили для ExerciseDetail
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)',
  },
  header: {
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
  },
  exerciseDetail: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e9ecef',
  },
  exerciseTitle: {
    margin: 0,
    fontSize: '2rem',
    color: '#202124',
  },
  customBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    color: '#202124',
  },
  description: {
    color: '#5f6368',
    lineHeight: '1.6',
    fontSize: '1rem',
  },
  imageContainer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  exerciseImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#5f6368',
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#202124',
    fontWeight: '500',
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

// Стили для видео
const videoStyles = {
  wrapper: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  container: {
    width: '100%',
    '& iframe': {
      width: '100%',
      minHeight: '400px',
      maxHeight: '600px',
      border: 'none',
      backgroundColor: '#000',
      display: 'block',
      borderRadius: '8px 8px 0 0',
    },
  },
  info: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f9f9f9',
    borderTop: '1px solid #eee',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#666',
  },
  note: {
    fontStyle: 'italic',
  },
  fallback: {
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    color: '#5f6368',
  },
  fallbackLink: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2787F5',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

// Добавляем hover эффекты для десктопа через JavaScript
if (typeof window !== 'undefined') {
  const addHoverStyles = () => {
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
      styles.backButton[':hover'] = {
        backgroundColor: '#1a73e8',
        color: 'white',
      };
      
      videoStyles.fallbackLink[':hover'] = {
        backgroundColor: '#1a6bc9',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(39, 135, 245, 0.3)',
      };
    }
  };
  
  // Вызываем при загрузке
  addHoverStyles();
  
  // Обновляем при изменении размера окна
  window.addEventListener('resize', addHoverStyles);
}

export default ExerciseDetail;