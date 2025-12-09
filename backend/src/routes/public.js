// backend/src/routes/public.js
const express = require('express');
const { Op } = require('sequelize');
const Workout = require('../models/Workout');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutExercise = require('../models/WorkoutExercise');
const router = express.Router();

// GET /api/public/workouts - Получить все публичные тренировки
router.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      where: { 
        is_public: true 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'], // Информация о создателе
        },
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Публичные тренировки получены успешно',
      workouts,
    });
  } catch (error) {
    console.error('Ошибка получения публичных тренировок:', error);
    res.status(500).json({
      message: 'Ошибка при получении публичных тренировок',
      error: error.message
    });
  }
});

// GET /api/public/workouts/:id - Получить конкретную публичную тренировку
router.get('/workouts/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      where: { 
        id: req.params.id,
        is_public: true 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        }
      ],
    });

    if (!workout) {
      return res.status(404).json({ message: 'Публичная тренировка не найдена' });
    }

    res.json({
      message: 'Публичная тренировка получена успешно',
      workout,
    });
  } catch (error) {
    console.error('Ошибка получения публичной тренировки:', error);
    res.status(500).json({
      message: 'Ошибка при получении публичной тренировки',
      error: error.message
    });
  }
});

module.exports = router;