const sequelize = require('../config/database');
const Workout = require('../models/Workout');
const User = require('../models/User');

const checkPublicWorkouts = async () => {
  try {
    console.log('🔍 Проверка публичных тренировок...');
    
    // Проверяем структуру таблицы
    const [columns] = await sequelize.query(`PRAGMA table_info(workouts)`);
    console.log('Структура таблицы workouts:');
    columns.forEach(col => {
      console.log(`  ${col.name} (${col.type}) - default: ${col.dflt_value}`);
    });
    
    // Проверяем все тренировки
    const allWorkouts = await Workout.findAll({
      attributes: ['id', 'name', 'is_public', 'user_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    console.log(`\nВсего тренировок: ${allWorkouts.length}`);
    allWorkouts.forEach(workout => {
      console.log(`  ID: ${workout.id}, Название: "${workout.name}", Публичная: ${workout.is_public}, Пользователь: ${workout.User.name}`);
    });
    
    // Проверяем публичные тренировки
    const publicWorkouts = await Workout.findAll({
      where: { is_public: true },
      attributes: ['id', 'name', 'is_public', 'user_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    console.log(`\nПубличных тренировок: ${publicWorkouts.length}`);
    publicWorkouts.forEach(workout => {
      console.log(`  ID: ${workout.id}, Название: "${workout.name}", Пользователь: ${workout.User.name}`);
    });
    
  } catch (error) {
    console.error('Ошибка при проверке:', error);
  } finally {
    await sequelize.close();
  }
};

// Запускаем если файл вызван напрямую
if (require.main === module) {
  checkPublicWorkouts();
}

module.exports = checkPublicWorkouts;