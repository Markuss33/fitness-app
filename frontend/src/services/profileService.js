import api from './api';

export const profileService = {
  // Получить профиль пользователя
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Обновить профиль пользователя
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
};