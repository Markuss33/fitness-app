const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверяем обязательные поля
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Все поля (email, password, name) обязательны' 
      });
    }

    // Проверяем существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Создаем пользователя
    const user = await User.create({
      email,
      password_hash: password, // хешируется автоматически в хуке модели
      name,
    });

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка при регистрации', 
      error: error.message 
    });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email и пароль обязательны' 
      });
    }

    // Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      message: 'Ошибка при входе', 
      error: error.message 
    });
  }
});

// Получение текущего пользователя (защищенный маршрут)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных пользователя' 
    });
  }
});
// backend/src/routes/auth.js - добавить этот маршрут
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log('=== CHANGE PASSWORD ===');
    console.log('User from middleware:', req.user.id, req.user.email);
    console.log('User password_hash from middleware:', req.user.password_hash);

    // Перезагружаем пользователя с включенным password_hash
    const userWithPassword = await User.findByPk(req.user.id, {
      attributes: { include: ['password_hash'] }
    });

    console.log('UserWithPassword from DB:', userWithPassword.id, userWithPassword.email);
    console.log('UserWithPassword password_hash from DB:', userWithPassword.password_hash);

    if (!userWithPassword.password_hash) {
      console.log('Password hash is missing in database for user:', userWithPassword.email);
      return res.status(400).json({ 
        message: 'Ошибка: хеш пароля не найден в базе данных' 
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword, 
      userWithPassword.password_hash
    );

    console.log('Password validation result:', isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Текущий пароль неверен' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await userWithPassword.update({ password_hash: newPasswordHash });

    console.log('Password changed successfully for user:', userWithPassword.email);
    res.json({ message: 'Пароль успешно изменен' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Ошибка при смене пароля',
      error: error.message 
    });
  }
});

module.exports = router;