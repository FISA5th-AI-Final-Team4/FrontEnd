import React from 'react';
import styles from './MenuItem.module.css';

function MenuItem({ label, onSelect }) {
  return (
    <button type="button" className={styles.itemButton} onClick={onSelect}>
      {label}
    </button>
  );
}

export default MenuItem;
