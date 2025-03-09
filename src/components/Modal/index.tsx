import React from "react";
import styles from "./stayle.module.scss"; // Стили для модального окна

type ModalDialogProps = {
  isOpen: boolean; // Флаг, открыто ли окно
  onClose: () => void; // Функция для закрытия окна
  position: { top: number; left: number }; // Позиция модального окна
  children: React.ReactNode; // Содержимое модального окна
};

const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  position,
  children,
}) => {
  if (!isOpen) return null; // Если окно закрыто, не рендерим его

  return (
    <div
      className={styles.modal}
      style={{ top: position.top, left: position.left }}
    >
      <div className={styles.modalContent}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default ModalDialog;
