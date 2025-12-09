import React from 'react';

const WorkoutView = ({ workout, onEdit, onDelete }) => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>{workout.name}</h1>
          {workout.description && (
            <p style={styles.description}>{workout.description}</p>
          )}
        </div>
        <div style={styles.actions}>
          <button onClick={onEdit} style={styles.editButton}>
            Редактировать
          </button>
          <button onClick={() => onDelete(workout.id)} style={styles.deleteButton}>
            Удалить
          </button>
        </div>
      </header>

      <div style={styles.exercises}>
        <h2 style={styles.exercisesTitle}>Упражнения</h2>
        {workout.Exercises && workout.Exercises.length > 0 ? (
          <div style={styles.exerciseList}>
            {workout.Exercises.map((exercise, index) => (
              <div key={exercise.id} style={styles.exerciseCard}>
                <div style={styles.exerciseHeader}>
                  <h3 style={styles.exerciseName}>{exercise.name}</h3>
                  <div style={styles.exerciseParams}>
                    {exercise.WorkoutExercise.sets && (
                      <span>Подходы: {exercise.WorkoutExercise.sets}</span>
                    )}
                    {exercise.WorkoutExercise.reps && (
                      <span>Повторения: {exercise.WorkoutExercise.reps}</span>
                    )}
                  </div>
                </div>
                
                {exercise.description && (
                  <p style={styles.exerciseDescription}>{exercise.description}</p>
                )}
                
                {exercise.WorkoutExercise.notes && (
                  <div style={styles.notes}>
                    <strong>Заметки:</strong> {exercise.WorkoutExercise.notes}
                  </div>
                )}
                
                <div style={styles.exerciseMedia}>
                  {exercise.image_url && (
                    <div style={styles.imagePlaceholder}>
                      🖼️ Изображение: {exercise.image_url}
                    </div>
                  )}
                  
                  {exercise.video_url && (
                    <a 
                      href={exercise.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.videoLink}
                    >
                      📹 Смотреть видео
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyExercises}>
            <p>В этой тренировке пока нет упражнений</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e9ecef',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    color: '#202124',
  },
  description: {
    margin: 0,
    color: '#5f6368',
    fontSize: '1.1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  exercises: {
    marginTop: '2rem',
  },
  exercisesTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#202124',
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  exerciseCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  exerciseName: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#202124',
  },
  exerciseParams: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#5f6368',
  },
  exerciseDescription: {
    margin: '0 0 1rem 0',
    color: '#5f6368',
    lineHeight: '1.5',
  },
  notes: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  exerciseMedia: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  imagePlaceholder: {
    backgroundColor: '#e9ecef',
    padding: '1rem',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#6c757d',
  },
  videoLink: {
    color: '#1a73e8',
    textDecoration: 'none',
  },
  emptyExercises: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#6c757d',
  },
};

export default WorkoutView;