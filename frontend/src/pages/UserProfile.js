import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import api from '../services/api';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    loadProfile();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      
      if (response.profile) {
        setProfile({
          height: response.profile.height || '',
          weight: response.profile.weight || '',
          age: response.profile.age || '',
          fitness_level: response.profile.fitness_level || 'beginner',
        });
      } else {
        setProfile({
          height: '',
          weight: '',
          age: '',
          fitness_level: 'beginner',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        height: '',
        weight: '',
        age: '',
        fitness_level: 'beginner',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      await profileService.updateProfile(profile);
      setMessage('Профиль успешно сохранен!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Новые пароли не совпадают');
    }
    
    if (passwordData.newPassword.length < 8) {
      return setPasswordError('Пароль должен содержать минимум 8 символов');
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMessage('');
      
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordMessage('Пароль успешно изменен!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setIsChangingPassword(false);
      }, 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Ошибка при смене пароля');
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordMessage('');
  };

  const displayValue = (value, unit = '') => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 'Не указано';
    }
    return `${value} ${unit}`.trim();
  };

  const fitnessLevels = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    professional: 'Профессионал'
  };

  if (loading || !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div>Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={isMobile ? styles.mobileHeader : styles.header}>
        <h1 style={isMobile ? styles.mobilePageTitle : styles.pageTitle}>Мой профиль</h1>
        <p style={isMobile ? styles.mobileSubtitle : styles.subtitle}>Управляйте вашими персональными данными</p>
      </div>

      {message && (
        <div style={isMobile ? styles.mobileMessage : styles.message}>
          {message}
        </div>
      )}

      <div style={styles.profileGrid}>
        {/* Основная информация */}
        <div style={isMobile ? styles.mobileSection : styles.section}>
          <div style={isMobile ? styles.mobileUserInfo : styles.userInfo}>
            <div style={isMobile ? styles.mobileAvatar : styles.avatar}>
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <h3 style={isMobile ? styles.mobileUserName : styles.userName}>{user?.name || 'Не указано'}</h3>
              <p style={isMobile ? styles.mobileUserEmail : styles.userEmail}>{user?.email || 'Не указано'}</p>
              
              {!isChangingPassword ? (
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  style={isMobile ? styles.mobileChangePasswordButton : styles.changePasswordButton}
                >
                  🔐 Сменить пароль
                </button>
              ) : (
                <div style={isMobile ? styles.mobilePasswordFormContainer : styles.passwordFormContainer}>
                  <h4 style={styles.passwordFormTitle}>Смена пароля</h4>
                  
                  {passwordMessage && (
                    <div style={styles.successMessage}>
                      {passwordMessage}
                    </div>
                  )}
                  
                  {passwordError && (
                    <div style={styles.errorMessage}>
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} style={styles.passwordForm}>
                    <div style={styles.inputGroup}>
                      <label style={isMobile ? styles.mobileLabel : styles.label}>Текущий пароль:</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        required
                        style={isMobile ? styles.mobileInput : styles.input}
                        disabled={passwordLoading}
                        placeholder="Введите текущий пароль"
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={isMobile ? styles.mobileLabel : styles.label}>Новый пароль:</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        required
                        style={isMobile ? styles.mobileInput : styles.input}
                        disabled={passwordLoading}
                        placeholder="Минимум 8 символов"
                        minLength="8"
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={isMobile ? styles.mobileLabel : styles.label}>Подтвердите пароль:</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        required
                        style={isMobile ? styles.mobileInput : styles.input}
                        disabled={passwordLoading}
                        placeholder="Повторите новый пароль"
                      />
                    </div>
                    
                    <div style={isMobile ? styles.mobilePasswordActions : styles.passwordActions}>
                      <button 
                        type="submit" 
                        disabled={passwordLoading}
                        style={isMobile ? styles.mobileSavePasswordButton : styles.savePasswordButton}
                      >
                        {passwordLoading ? 'Сохранение...' : '💾 Сохранить'}
                      </button>
                      <button 
                        type="button"
                        onClick={cancelPasswordChange}
                        disabled={passwordLoading}
                        style={isMobile ? styles.mobileCancelPasswordButton : styles.cancelPasswordButton}
                      >
                        ❌ Отмена
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Спортивные данные */}
        <div style={isMobile ? styles.mobileSection : styles.section}>
          <div style={isMobile ? styles.mobileSectionHeader : styles.sectionHeader}>
            <h2 style={isMobile ? styles.mobileSectionTitle : styles.sectionTitle}>Спортивные данные</h2>
          </div>
          
          {isEditing ? (
            <>
              <div style={isMobile ? styles.mobileForm : styles.form}>
                <div style={styles.inputGroup}>
                  <label style={isMobile ? styles.mobileLabel : styles.label}>Рост (см)</label>
                  <input
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => handleChange('height', e.target.value)}
                    style={isMobile ? styles.mobileInput : styles.input}
                    placeholder="Например: 180"
                    min="100"
                    max="250"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={isMobile ? styles.mobileLabel : styles.label}>Вес (кг)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.weight || ''}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    style={isMobile ? styles.mobileInput : styles.input}
                    placeholder="Например: 75.5"
                    min="30"
                    max="300"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={isMobile ? styles.mobileLabel : styles.label}>Возраст</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', e.target.value)}
                    style={isMobile ? styles.mobileInput : styles.input}
                    placeholder="Например: 25"
                    min="10"
                    max="120"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={isMobile ? styles.mobileLabel : styles.label}>Уровень подготовки</label>
                  <select
                    value={profile.fitness_level || 'beginner'}
                    onChange={(e) => handleChange('fitness_level', e.target.value)}
                    style={isMobile ? styles.mobileSelect : styles.select}
                  >
                    <option value="beginner">Новичок</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                    <option value="professional">Профессионал</option>
                  </select>
                </div>
              </div>
              <div style={isMobile ? styles.mobileEditActions : styles.editActions}>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  style={isMobile ? styles.mobileSaveButton : styles.saveButton}
                >
                  💾 Сохранить
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={loading}
                  style={isMobile ? styles.mobileCancelButton : styles.cancelButton}
                >
                  ❌ Отмена
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={isMobile ? styles.mobileProfileData : styles.profileData}>
                <div style={styles.dataRow}>
                  <span style={isMobile ? styles.mobileDataLabel : styles.dataLabel}>Рост:</span>
                  <span style={isMobile ? styles.mobileDataValue : styles.dataValue}>
                    {displayValue(profile.height, 'см')}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={isMobile ? styles.mobileDataLabel : styles.dataLabel}>Вес:</span>
                  <span style={isMobile ? styles.mobileDataValue : styles.dataValue}>
                    {displayValue(profile.weight, 'кг')}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={isMobile ? styles.mobileDataLabel : styles.dataLabel}>Возраст:</span>
                  <span style={isMobile ? styles.mobileDataValue : styles.dataValue}>
                    {displayValue(profile.age, 'лет')}
                  </span>
                </div>
                <div style={styles.dataRow}>
                  <span style={isMobile ? styles.mobileDataLabel : styles.dataLabel}>Уровень подготовки:</span>
                  <span style={isMobile ? styles.mobileDataValue : styles.dataValue}>
                    {fitnessLevels[profile.fitness_level] || 'Не указано'}
                  </span>
                </div>
              </div>
              <div style={isMobile ? styles.mobileButtonContainer : styles.buttonContainer}>
                <button onClick={handleEdit} style={isMobile ? styles.mobileEditButton : styles.editButton}>
                  ✏️ Редактировать
                </button>
              </div>
            </>
          )}
        </div>

        {/* Быстрый доступ */}
        <div style={isMobile ? styles.mobileSection : styles.section}>
          <h2 style={isMobile ? styles.mobileSectionTitle : styles.sectionTitle}>Быстрый доступ</h2>
          <div style={isMobile ? styles.mobileQuickLinks : styles.quickLinks}>
            <a href="/workouts" style={isMobile ? styles.mobileQuickLink : styles.quickLink}>
              📋 Мои тренировки
            </a>
            <a href="/workout-builder" style={isMobile ? styles.mobileQuickLink : styles.quickLink}>
              ➕ Создать тренировку
            </a>
            <a href="/exercises" style={isMobile ? styles.mobileQuickLink : styles.quickLink}>
              💪 Упражнения
            </a>
            <a href="/public-workouts" style={isMobile ? styles.mobileQuickLink : styles.quickLink}>
              🌐 Общедоступные
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // Общие стили
  container: {
    padding: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)',
  },
  
  // Десктопные стили
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  pageTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.75rem',
    color: '#202124',
    fontWeight: '600',
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '1.1rem',
  },
  
  // Мобильные стили
  mobileHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  mobilePageTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.5rem',
    color: '#202124',
    fontWeight: '600',
  },
  mobileSubtitle: {
    margin: 0,
    color: '#666',
    fontSize: '1rem',
  },
  
  // Сообщения
  message: {
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  mobileMessage: {
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  
  // Сетка профиля
  profileGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  
  // Секции
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mobileSection: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  
  // Пользовательская информация
  userInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  userDetails: {
    flex: 1,
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  mobileAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  userName: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.25rem',
    color: '#202124',
  },
  mobileUserName: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.1rem',
    color: '#202124',
  },
  userEmail: {
    margin: '0 0 1rem 0',
    color: '#666',
    fontSize: '0.95rem',
  },
  mobileUserEmail: {
    margin: '0 0 1rem 0',
    color: '#666',
    fontSize: '0.9rem',
  },
  
  // Кнопка смены пароля
  changePasswordButton: {
    backgroundColor: 'transparent',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    marginTop: '0.5rem',
    width: '100%',
    maxWidth: '200px',
  },
  mobileChangePasswordButton: {
    backgroundColor: 'transparent',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '0.5rem',
    width: '100%',
  },
  
  // Форма смены пароля
  passwordFormContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  mobilePasswordFormContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  passwordFormTitle: {
    margin: '0 0 0.75rem 0',
    color: '#333',
    fontSize: '1rem',
  },
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  passwordActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  mobilePasswordActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  savePasswordButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    flex: 1,
  },
  mobileSavePasswordButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    width: '100%',
  },
  cancelPasswordButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    flex: 1,
  },
  mobileCancelPasswordButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    width: '100%',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.5rem',
    borderRadius: '6px',
    marginBottom: '0.75rem',
    border: '1px solid #c3e6cb',
    fontSize: '0.85rem',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.5rem',
    borderRadius: '6px',
    marginBottom: '0.75rem',
    border: '1px solid #f5c6cb',
    fontSize: '0.85rem',
  },
  
  // Заголовки секций
  sectionHeader: {
    marginBottom: '1.25rem',
  },
  mobileSectionHeader: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#202124',
  },
  mobileSectionTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#202124',
  },
  
  // Форма редактирования
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBottom: '1.25rem',
  },
  mobileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  
  // Данные профиля (режим просмотра)
  profileData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  mobileProfileData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1rem',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  dataLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },
  mobileDataLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem',
  },
  dataValue: {
    color: '#666',
    fontSize: '0.95rem',
  },
  mobileDataValue: {
    color: '#666',
    fontSize: '0.9rem',
  },
  
  // Контейнеры кнопок
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  mobileButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  
  // Кнопки редактирования/сохранения
  editActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  mobileEditActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  editButton: {
    backgroundColor: '#f8f9fa',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  mobileEditButton: {
    backgroundColor: '#f8f9fa',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  mobileSaveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  mobileCancelButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    width: '100%',
  },
  
  // Быстрые ссылки
  quickLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  mobileQuickLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  quickLink: {
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#1a73e8',
    fontWeight: '500',
    fontSize: '0.95rem',
    textAlign: 'center',
    transition: 'background-color 0.2s',
  },
  mobileQuickLink: {
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#1a73e8',
    fontWeight: '500',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  
  // Общие элементы форм
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },
  mobileLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  mobileInput: {
    padding: '0.6rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    fontFamily: 'inherit',
  },
  mobileSelect: {
    padding: '0.6rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: 'white',
    fontFamily: 'inherit',
  },
  
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#666',
  },
};

// Добавляем hover эффекты только для десктопа
if (typeof window !== 'undefined') {
  styles.quickLink[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
  
  styles.editButton[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
  
  styles.saveButton[':hover'] = {
    backgroundColor: '#218838',
  };
  
  styles.cancelButton[':hover'] = {
    backgroundColor: '#c82333',
  };
  
  styles.changePasswordButton[':hover'] = {
    backgroundColor: '#e8f0fe',
  };
  
  styles.savePasswordButton[':hover'] = {
    backgroundColor: '#218838',
  };
  
  styles.cancelPasswordButton[':hover'] = {
    backgroundColor: '#5a6268',
  };
  
  styles.input[':focus'] = {
    outline: 'none',
    borderColor: '#1a73e8',
    boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.2)',
  };
  
  styles.mobileInput[':focus'] = {
    outline: 'none',
    borderColor: '#1a73e8',
    boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.2)',
  };
  
  styles.select[':focus'] = {
    outline: 'none',
    borderColor: '#1a73e8',
    boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.2)',
  };
  
  styles.mobileSelect[':focus'] = {
    outline: 'none',
    borderColor: '#1a73e8',
    boxShadow: '0 0 0 2px rgba(26, 115, 232, 0.2)',
  };
}

export default UserProfile;