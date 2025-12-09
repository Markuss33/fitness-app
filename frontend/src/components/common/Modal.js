// frontend/src/components/common/Modal.js
import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  type = "info",
  showCancel = true // 🔥 ДОБАВЛЯЕМ НОВЫЙ ПРОП
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    const styles = {
      info: { borderColor: '#1a73e8', icon: 'ℹ️' },
      warning: { borderColor: '#fbbc05', icon: '⚠️' },
      danger: { borderColor: '#ea4335', icon: '❌' },
      success: { borderColor: '#34a853', icon: '✅' }
    };
    return styles[type] || styles.info;
  };

  const typeStyle = getTypeStyles();

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" style={{ borderTop: `4px solid ${typeStyle.borderColor}` }}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">{typeStyle.icon}</span>
            {title}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {children}
        </div>
        
        <div className="modal-footer">
          {/* 🔥 УСЛОВНЫЙ РЕНДЕРИНГ КНОПКИ ОТМЕНЫ */}
          {showCancel && (
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          
          {onConfirm && (
            <button 
              className={`btn btn-${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;