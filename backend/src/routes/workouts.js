const express = require('express');
const { Op } = require('sequelize');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const WorkoutExercise = require('../models/WorkoutExercise');
const User = require('../models/User'); // 🔧 ВАЖНО: импорт User
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Все маршруты защищены аутентификацией
router.use(authMiddleware);

// 🔧 ПЕРВЫМ должен идти маршрут /public/list - он более конкретный
router.get('/public/list', async (req, res) => {
  try {
    console.log('🔄 Fetching public workouts...');
    
    const workouts = await Workout.findAll({
      where: { 
        is_public: true 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Exercise,
          through: { 
            attributes: ['sets', 'reps', 'order', 'notes'] 
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log(`✅ Found ${workouts.length} public workouts`);

    res.json({
      message: 'Публичные тренировки получены успешно',
      workouts: workouts || [],
    });
  } catch (error) {
    console.error('❌ Ошибка получения публичных тренировок:', error);
    res.status(500).json({
      message: 'Ошибка при получении публичных тренировок',
      error: error.message
    });
  }
});

// 🔧 ВТОРЫМ идет маршрут /public/:id - он менее конкретный
router.get('/public/:id', async (req, res) => {
  try {
    console.log(`🔄 Fetching public workout with ID: ${req.params.id}`);
    
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
          through: { 
            attributes: ['sets', 'reps', 'order', 'notes'] 
          },
        },
      ],
    });

    if (!workout) {
      return res.status(404).json({ 
        message: 'Публичная тренировка не найдена или недоступна' 
      });
    }

    console.log(`✅ Found public workout: ${workout.name}`);
    
    res.json({
      message: 'Публичная тренировка получена успешно',
      workout,
    });
  } catch (error) {
    console.error('❌ Ошибка получения публичной тренировки:', error);
    res.status(500).json({
      message: 'Ошибка при получении публичной тренировки',
      error: error.message
    });
  }
});

// 🔧 ТРЕТЬИМ идет маршрут для сохранения
router.post('/public/:id/save', authMiddleware, async (req, res) => {
  try {
    console.log(`🔄 Saving public workout with ID: ${req.params.id} for user: ${req.user.id}`);
    
    const originalWorkout = await Workout.findOne({
      where: { 
        id: req.params.id,
        is_public: true 
      },
      include: [
        {
          model: Exercise,
          through: { 
            attributes: ['sets', 'reps', 'order', 'notes'] 
          },
        },
      ],
    });

    if (!originalWorkout) {
      return res.status(404).json({ 
        message: 'Публичная тренировка не найдена' 
      });
    }

    // Создаем копию тренировки для текущего пользователя
    const newWorkout = await Workout.create({
      name: `${originalWorkout.name} (копия)`,
      description: originalWorkout.description,
      is_public: false,
      user_id: req.user.id,
      created_from_workout_id: originalWorkout.id,
    });

    // Копируем упражнения
    if (originalWorkout.Exercises && originalWorkout.Exercises.length > 0) {
      const workoutExercises = originalWorkout.Exercises.map((exercise, index) => ({
        workout_id: newWorkout.id,
        exercise_id: exercise.id,
        sets: exercise.WorkoutExercise.sets,
        reps: exercise.WorkoutExercise.reps,
        order: exercise.WorkoutExercise.order || index,
        notes: exercise.WorkoutExercise.notes,
      }));

      await WorkoutExercise.bulkCreate(workoutExercises);
    }

    console.log(`✅ Workout saved successfully for user ${req.user.id}`);
    
    res.status(201).json({
      message: 'Тренировка успешно сохранена в ваш профиль',
      workout: {
        id: newWorkout.id,
        name: newWorkout.name,
        description: newWorkout.description,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка сохранения публичной тренировки:', error);
    res.status(500).json({
      message: 'Ошибка при сохранении тренировки',
      error: error.message
    });
  }
});
// GET /api/workouts - Получить все тренировки пользователя
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Тренировки получены успешно',
      workouts,
    });
  } catch (error) {
    console.error('Ошибка получения тренировок:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении тренировок', 
      error: error.message 
    });
  }
});

// GET /api/workouts/:id - Получить конкретную тренировку
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      },
      include: [
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        },
      ],
    });

    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }

    res.json({
      message: 'Тренировка получена успешно',
      workout,
    });
  } catch (error) {
    console.error('Ошибка получения тренировки:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении тренировки', 
      error: error.message 
    });
  }
});

// POST /api/workouts - Создать новую тренировку
router.post('/', async (req, res) => {
  try {
    const { name, description, is_public, exercises } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Название тренировки обязательно' });
    }

    // Создаем тренировку
    const workout = await Workout.create({
      name,
      description,
      is_public: is_public || false, // 🔧 Добавляем поддержку is_public
      user_id: req.user.id,
    });


    // Если есть упражнения, добавляем их
    if (exercises && exercises.length > 0) {
      const workoutExercises = exercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        order: exercise.order || index,
        notes: exercise.notes,
      }));

      await WorkoutExercise.bulkCreate(workoutExercises);
    }

    // Возвращаем тренировку с упражнениями
    const createdWorkout = await Workout.findByPk(workout.id, {
      include: [
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        },
      ],
    });

    res.status(201).json({
      message: 'Тренировка создана успешно',
      workout: createdWorkout,
    });
  } catch (error) {
    console.error('Ошибка создания тренировки:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании тренировки', 
      error: error.message 
    });
  }
});

// PUT /api/workouts/:id - Обновить тренировку
router.put('/:id', async (req, res) => {
  try {
    const { name, description, is_public, exercises } = req.body;

    const workout = await Workout.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      },
    });

    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }

    // Обновляем основные поля тренировки
    await workout.update({
      name: name || workout.name,
      description: description !== undefined ? description : workout.description,
      is_public: is_public !== undefined ? is_public : workout.is_public,
    });

    // 🔧 ДОБАВЛЯЕМ: Обработка упражнений
    if (exercises && Array.isArray(exercises)) {
      // Удаляем старые связи
      await WorkoutExercise.destroy({
        where: { workout_id: workout.id }
      });

      // Создаем новые связи с упражнениями
      const workoutExercisesData = exercises.map(exercise => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        order: exercise.order,
        notes: exercise.notes,
      }));

      await WorkoutExercise.bulkCreate(workoutExercisesData);
    }

    // 🔧 ДОБАВЛЯЕМ: Возвращаем полные данные тренировки
    const updatedWorkout = await Workout.findByPk(workout.id, {
      include: [
        {
          model: Exercise,
          through: { attributes: ['sets', 'reps', 'order', 'notes'] },
        },
      ],
    });

    res.json({
      message: 'Тренировка обновлена успешно',
      workout: updatedWorkout,
    });
  } catch (error) {
    console.error('Ошибка обновления тренировки:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении тренировки', 
      error: error.message 
    });
  }
});

// DELETE /api/workouts/:id - Удалить тренировку
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      },
    });

    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }

    await workout.destroy();

    res.json({
      message: 'Тренировка удалена успешно',
    });
  } catch (error) {
    console.error('Ошибка удаления тренировки:', error);
    res.status(500).json({ 
      message: 'Ошибка при удалении тренировки', 
      error: error.message 
    });
  }

});

module.exports = router;