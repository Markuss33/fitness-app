const express = require('express');
const { Op } = require('sequelize'); // ← ДОБАВЬТЕ ЭТУ СТРОКУ
const Exercise = require('../models/Exercise');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/exercises - Получить все упражнения (публичные + пользовательские)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      where: {
        [Op.or]: [
          { is_custom: false }, // Базовые упражнения
          { is_custom: true }   // Пользовательские упражнения (в будущем)
        ]
      },
      order: [['name', 'ASC']],
    });

    res.json({
      message: 'Упражнения получены успешно',
      exercises,
    });
  } catch (error) {
    console.error('Ошибка получения упражнений:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении упражнений', 
      error: error.message 
    });
  }
});

// POST /api/exercises - Создать пользовательское упражнение
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, video_url, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Название упражнения обязательно' });
    }

    const exercise = await Exercise.create({
      name,
      description,
      video_url,
      image_url,
      is_custom: true, // Помечаем как пользовательское
    });

    res.status(201).json({
      message: 'Упражнение создано успешно',
      exercise,
    });
  } catch (error) {
    console.error('Ошибка создания упражнения:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании упражнения', 
      error: error.message 
    });
  }
});
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Упражнение не найдено' });
    }

    res.json({
      message: 'Упражнение получено успешно',
      exercise
    });
  } catch (error) {
    console.error('Ошибка получения упражнения:', error);
    res.status(500).json({
      message: 'Ошибка при получении упражнения',
      error: error.message
    });
  }
});

module.exports = router;