const { Sequelize } = require('sequelize');
require('dotenv').config();

// Используем SQLite для разработки
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './fitness_database.sqlite', // Файл БД создается автоматически
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Тестируем подключение
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite база данных подключена!');
    console.log('📁 Файл БД: fitness_database.sqlite');
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error.message);
  }
};

testConnection();

module.exports = sequelize;