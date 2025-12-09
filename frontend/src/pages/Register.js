// pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordTips, setPasswordTips] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      return setError('Заполните все поля');
    }

    // 🔧 Проверка сложности пароля
    if (password.length < 8) {
      return setError('Пароль должен содержать минимум 8 символов');
    }

    try {
      setError('');
      setLoading(true);
      const result = await register(name, email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка при создании аккаунта');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (pass) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
    
    if (strongRegex.test(pass)) return 'strong';
    if (mediumRegex.test(pass)) return 'medium';
    return 'weak';
  };

  const passwordStrength = checkPasswordStrength(password);

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2>Регистрация</h2>
        
        {/* 🔧 Блок с рекомендациями по безопасности */}
        <div style={styles.securityNote}>
          <h4>💡 Рекомендации по безопасности:</h4>
          <ul style={styles.tipsList}>
            <li>Используйте уникальный пароль для этого сервиса</li>
            <li>Пароль должен содержать минимум 8 символов</li>
            <li>Рекомендуем использовать буквы, цифры и специальные символы</li>
            <li>Не используйте пароли от других сервисов</li>
          </ul>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Имя:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              onFocus={() => setPasswordTips(true)}
            />
            
            {/* 🔧 Индикатор сложности пароля */}
            {passwordTips && password && (
              <div style={styles.passwordStrength}>
                <div style={styles.strengthIndicator}>
                  <div 
                    style={{
                      ...styles.strengthBar,
                      ...styles[`strength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`]
                    }}
                  ></div>
                </div>
                <span style={styles[`strengthText${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`]}>
                  {passwordStrength === 'strong' ? 'Надежный пароль' : 
                   passwordStrength === 'medium' ? 'Средняя надежность' : 'Слабый пароль'}
                </span>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p style={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  securityNote: {
    backgroundColor: '#e8f4fd',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    border: '1px solid #b3d9ff',
  },
  tipsList: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
    fontSize: '0.9rem',
    color: '#555',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  passwordStrength: {
    marginTop: '0.5rem',
  },
  strengthIndicator: {
    height: '4px',
    backgroundColor: '#eee',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  strengthBar: {
    height: '100%',
    transition: 'width 0.3s, background-color 0.3s',
  },
  strengthStrong: {
    width: '100%',
    backgroundColor: '#28a745',
  },
  strengthMedium: {
    width: '66%',
    backgroundColor: '#ffc107',
  },
  strengthWeak: {
    width: '33%',
    backgroundColor: '#dc3545',
  },
  strengthTextStrong: {
    color: '#28a745',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  strengthTextMedium: {
    color: '#ffc107',
    fontSize: '0.8rem',
  },
  strengthTextWeak: {
    color: '#dc3545',
    fontSize: '0.8rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
  },
  link: {
    textAlign: 'center',
    marginTop: '1rem',
  },
};

export default Register;