import axios from 'axios';

// Получаем URL из переменных окружения или используем умный выбор
const getApiBaseUrl = () => {
  // Если указана переменная окружения - используем её
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Иначе определяем динамически
  const hostname = window.location.hostname;
  const port = 5000;
  
  console.log('Frontend hostname:', hostname);
  
  // Если открыто с мобильного устройства по IP
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:${port}/api`;
  }
  
  // Если локально на ПК
  return `http://localhost:${port}/api`;
};

// Создаем экземпляр axios
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

console.log('📡 API Base URL:', api.defaults.baseURL);

// Перехватчик для запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`➡️ API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик для ответов
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
    });
    
    // Улучшенные сообщения об ошибках
    if (error.code === 'ECONNABORTED') {
      error.message = 'Сервер не отвечает. Проверьте, запущен ли backend.';
    } else if (error.message === 'Network Error') {
      error.message = `Не удается подключиться к серверу. Убедитесь что backend доступен по адресу: ${error.config?.baseURL}`;
    } else if (!error.response) {
      error.message = 'Ошибка сети. Проверьте подключение к интернету.';
    }
    
    return Promise.reject(error);
  }
);

export default api;