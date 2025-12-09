const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
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
    },
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  detailed_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Добавьте это поле для embed-кода
  video_embed: {
    type: DataTypes.TEXT, // Используем TEXT для HTML-кода
    allowNull: true,
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Дополнительные поля, если они используются
  muscle_group: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  equipment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  target_muscles: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'exercises',
});

module.exports = Exercise;