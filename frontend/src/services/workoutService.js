import api from './api';

export const workoutService = {
  // Получить все тренировки пользователя
  getWorkouts: async () => {
    const response = await api.get('/workouts');
    return response.data;
  },

  // Получить конкретную тренировку
  getWorkout: async (id) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  // Создать тренировку
  createWorkout: async (workoutData) => {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },

  // Обновить тренировку
  updateWorkout: async (id, workoutData) => {
    const response = await api.put(`/workouts/${id}`, workoutData);
    return response.data;
  },

  // Удалить тренировку
  deleteWorkout: async (id) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },
  getPublicWorkouts: async () => {
    const response = await api.get('/workouts/public/list');
    return response.data;
  },

  getPublicWorkout: async (id) => {
    const response = await api.get(`/workouts/public/${id}`);
    return response.data;
  },

  savePublicWorkout: async (id) => {
    const response = await api.post(`/workouts/public/${id}/save`);
    return response.data;
  },
  getPublicWorkoutDetail: async (workoutId) => {
    const response = await api.get(`/workouts/public/${workoutId}`);
    return response.data;
  },
  
  savePublicWorkout: async (workoutId) => {
    const response = await api.post(`/workouts/public/${workoutId}/save`);
    return response.data;
  }
};