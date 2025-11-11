import React from 'react';
import styles from './Menu.module.css';

function Menu({ isOpen, onClose, bottomOffset = 0 }) {
  const overlayStyle = bottomOffset
    ? { bottom: `${bottomOffset}px` }
    : undefined;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      onClick={onClose}
      style={overlayStyle}
      aria-hidden={!isOpen}
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 메뉴 내용은 향후 채워질 예정 */}
      </div>
    </div>
  );
}

export default Menu;
