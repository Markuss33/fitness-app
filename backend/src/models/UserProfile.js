const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 100,
      max: 250,
    },
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 30,
      max: 300,
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 10,
      max: 120,
    },
  },
  fitness_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'professional'),
    defaultValue: 'beginner',
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'user_profiles',
});

module.exports = UserProfile;