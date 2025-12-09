// frontend/src/hooks/useModal.js
import { useState, useCallback } from 'react';
import Modal from '../components/common/Modal';

export const useModal = () => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onClose: null,
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    showCancel: true // 🔥 ДОБАВЛЯЕМ НОВЫЙ ПАРАМЕТР
  });

  const showModal = useCallback((config) => {
    setModal({
      isOpen: true,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null,
      onClose: null,
      confirmText: 'Подтвердить',
      cancelText: 'Отмена',
      showCancel: true,
      ...config
    });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      showModal({
        type: 'warning',
        showCancel: true, // 🔥 ДЛЯ CONFIRM ПОКАЗЫВАЕМ ОБЕ КНОПКИ
        ...config,
        onConfirm: () => {
          hideModal();
          resolve(true);
        },
        onClose: () => {
          hideModal();
          resolve(false);
        }
      });
    });
  }, [showModal, hideModal]);

  const alert = useCallback((config) => {
    return new Promise((resolve) => {
      showModal({
        type: 'info',
        confirmText: 'OK',
        showCancel: false, // 🔥 ДЛЯ ALERT СКРЫВАЕМ КНОПКУ ОТМЕНЫ
        ...config,
        onConfirm: () => {
          hideModal();
          resolve(true);
        },
        onClose: () => {
          hideModal();
          resolve(true);
        }
      });
    });
  }, [showModal, hideModal]);

  const ModalComponent = () => (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose || hideModal}
      title={modal.title}
      type={modal.type}
      onConfirm={modal.onConfirm}
      confirmText={modal.confirmText}
      cancelText={modal.cancelText}
      showCancel={modal.showCancel} // 🔥 ПЕРЕДАЕМ В КОМПОНЕНТ
    >
      {modal.message}
    </Modal>
  );

  return {
    modal,
    showModal,
    hideModal,
    confirm,
    alert,
    ModalComponent
  };
};

export default useModal;