const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oauth_google_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      // 🔧 ИСПРАВЛЕНИЕ: Проверяем, изменился ли password_hash
      if (user.changed('password_hash') && user.password_hash) {
        console.log('Hashing password on update');
        // 🔧 ВАЖНО: Проверяем, не хеширован ли уже пароль
        if (!user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      }
    },
  },
});

// Метод для проверки пароля
User.prototype.validatePassword = async function(password) {
  if (!this.password_hash) {
    console.log('No password hash stored');
    return false;
  }
  
  try {
    const isValid = await bcrypt.compare(password, this.password_hash);
    console.log('Password comparison result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Метод для безопасного возврата пользователя (без пароля)
User.prototype.toSafeObject = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;