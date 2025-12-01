import React from 'react';
import styles from './MenuItem.module.css';

function MenuItem({ label, onSelect, alignment = 'left' }) {
  const className =
    alignment === 'center'
      ? `${styles.itemButton} ${styles.itemButtonCenter}`
      : styles.itemButton;

  return (
    <button type="button" className={className} onClick={onSelect}>
      {label}
    </button>
  );
}

export default MenuItem;
