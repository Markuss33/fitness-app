// backend/src/routes/debug.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Диагностика пользователя по email
router.get('/check-user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { email: req.params.email },
      attributes: { include: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      hasPasswordHash: !!user.password_hash,
      passwordHash: user.password_hash ? 'Есть' : 'Отсутствует',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при проверке пользователя',
      error: error.message
    });
  }
});

module.exports = router;