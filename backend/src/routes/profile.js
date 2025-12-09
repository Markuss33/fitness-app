const express = require('express');
const UserProfile = require('../models/UserProfile');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/profile - Получить профиль пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({
      where: { user_id: req.user.id }
    });

    // Если профиля нет, создаем пустой
    if (!profile) {
      profile = await UserProfile.create({
        user_id: req.user.id,
        fitness_level: 'beginner'
      });
    }

    res.json({
      message: 'Профиль получен успешно',
      profile,
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении профиля', 
      error: error.message 
    });
  }
});

// PUT /api/profile - Обновить профиль пользователя
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { height, weight, age, fitness_level } = req.body;

    const [profile, created] = await UserProfile.findOrCreate({
      where: { user_id: req.user.id },
      defaults: {
        user_id: req.user.id,
        fitness_level: 'beginner'
      }
    });

    await profile.update({
      height: height !== undefined ? height : profile.height,
      weight: weight !== undefined ? weight : profile.weight,
      age: age !== undefined ? age : profile.age,
      fitness_level: fitness_level || profile.fitness_level,
    });

    res.json({
      message: 'Профиль обновлен успешно',
      profile,
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении профиля', 
      error: error.message 
    });
  }
});

module.exports = router;