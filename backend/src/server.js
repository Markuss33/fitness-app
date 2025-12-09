const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');

// Импорт моделей
const User = require('./models/User');
const Workout = require('./models/Workout');
const Exercise = require('./models/Exercise');
const WorkoutExercise = require('./models/WorkoutExercise');
const UserProfile = require('./models/UserProfile');
// Импорт маршрутов
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');  
const uploadRoutes = require('./routes/upload');
const profileRoutes = require('./routes/profile');
const debugRoutes = require('./routes/debug');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 5000;

const seedExercises = require('./seeders/seedExercises');
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ==================== НАСТРОЙКА СВЯЗЕЙ МЕЖДУ МОДЕЛЯМИ ====================

User.hasMany(Workout, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE' 
});
Workout.belongsTo(User, { 
  foreignKey: 'user_id' 
});

Workout.belongsToMany(Exercise, {
  through: WorkoutExercise,
  foreignKey: 'workout_id',
  otherKey: 'exercise_id'
});
Exercise.belongsToMany(Workout, {
  through: WorkoutExercise,
  foreignKey: 'exercise_id', 
  otherKey: 'workout_id'
});

Workout.hasMany(WorkoutExercise, {
  foreignKey: 'workout_id',
  onDelete: 'CASCADE'
});
WorkoutExercise.belongsTo(Workout, {
  foreignKey: 'workout_id'
});

Exercise.hasMany(WorkoutExercise, {
  foreignKey: 'exercise_id',
  onDelete: 'CASCADE'
});
WorkoutExercise.belongsTo(Exercise, {
  foreignKey: 'exercise_id'
});

User.hasOne(UserProfile, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
UserProfile.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// ==================== ПОДКЛЮЧЕНИЕ МАРШРУТОВ ====================

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);   
app.use('/api/exercises', exerciseRoutes);  
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);


// ==================== ТЕСТОВЫЕ МАРШРУТЫ ====================

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Сервер работает! 🎉',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      message: 'База данных подключена! 🗄️',
      database: 'SQLite',
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка подключения к БД',
      error: error.message 
    });
  }
});

// Защищенный тестовый маршрут (проверим позже)
app.get('/api/protected-test', (req, res) => {
  res.json({ 
    message: 'Это защищенный маршрут - пока не работает',
    note: 'Добавим middleware позже'
  });
});

// Добавьте перед обработчиком 404
app.get('/', (req, res) => {
  res.json({
    message: 'API сервер работает!',
    endpoints: {
      test: '/api/test',
      db_test: '/api/db-test',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      },
      workouts: '/api/workouts',
      exercises: '/api/exercises'
    },
    documentation: 'Используйте указанные маршруты API'
  });
});
// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});
// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем все origins включая LocalTunnel
    const allowedOrigins = [
      'http://localhost:3000',
      'https://workoutbuilder.loca.lt',
      'https://workoutbuilder-api.loca.lt',
      'http://workoutbuilder.loca.lt'
    ];
    
    // В разработке разрешаем все
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Заблокировано CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
// ==================== ЗАПУСК СЕРВЕРА ====================

// ==================== ЗАПУСК СЕРВЕРА ====================

const startServer = async () => {
  try {
    // Синхронизируем модели с БД
    await sequelize.sync({ force: false });
    await seedExercises();
    console.log('✅ Все модели синхронизированы с БД');
    
    // Запускаем сервер на всех сетевых интерфейсах
    const HOST = process.env.HOST || '0.0.0.0'; // Важно: 0.0.0.0 вместо localhost
    const PORT = process.env.PORT || 5000;
    
// В конце файла измените:
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен и доступен по адресам:`);
    console.log(`   - Локально: http://localhost:${PORT}`);
    console.log(`   - В сети: http://192.168.1.181:${PORT}`);
    console.log(`   - Через LocalTunnel: https://workoutbuilder-api.loca.lt`);
});
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer();