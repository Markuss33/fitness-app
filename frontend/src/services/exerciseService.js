import api from './api';

export const exerciseService = {
  // Получить все упражнения
  getExercises: async () => {
    const response = await api.get('/exercises');
    return response.data;
  },

  // Получить упражнение по ID
  getExerciseById: async (exerciseId) => {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  },

  // Создать упражнение
  createExercise: async (exerciseData) => {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  },
};