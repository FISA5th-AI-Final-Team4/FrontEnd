import React from 'react';
import styles from './MenuSection.module.css';
import MenuItem from './MenuItem';

function MenuSection({
  title,
  items = [],
  onSelect,
  layout = 'column',
  variant = 'default',
  itemAlignment = 'left',
}) {
  const listClassName =
    layout === 'grid'
      ? `${styles.itemList} ${styles.itemGrid}`
      : styles.itemList;

  const normalizedVariant = variant ?? 'default';
  const variantClassKey = `section${normalizedVariant
    .charAt(0)
    .toUpperCase()}${normalizedVariant.slice(1)}`;
  const sectionClassName = [
    styles.section,
    styles[variantClassKey],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClassName}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={listClassName}>
        {items.map((question) => (
          <MenuItem
            key={question}
            label={question}
            alignment={itemAlignment}
            onSelect={() => onSelect?.(question)}
          />
        ))}
      </div>
    </section>
  );
}

export default MenuSection;
