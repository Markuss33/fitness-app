// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = 5000; // порт вашего backend
  
  // Если открыто с телефона по IP (например 192.168.1.181:3000)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:${port}/api`;
  }
  
  // Если локально на ПК
  return `http://localhost:${port}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Для отладки
console.log('API Base URL:', API_BASE_URL);
console.log('Current hostname:', window.location.hostname);