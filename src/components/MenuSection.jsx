import React from 'react';
import styles from './MenuSection.module.css';
import MenuItem from './MenuItem';

function MenuSection({ title, items = [], onSelect, layout = 'column' }) {
  const listClassName =
    layout === 'grid'
      ? `${styles.itemList} ${styles.itemGrid}`
      : styles.itemList;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={listClassName}>
        {items.map((question) => (
          <MenuItem
            key={question}
            label={question}
            onSelect={() => onSelect?.(question)}
          />
        ))}
      </div>
    </section>
  );
}

export default MenuSection;
