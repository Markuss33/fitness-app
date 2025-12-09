const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // ДОБАВЛЯЕМ ЭТО ПОЛЕ ↓
  created_from_workout_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'workouts',
      key: 'id',
    },
  },
}, {
  tableName: 'workouts',
});

module.exports = Workout;