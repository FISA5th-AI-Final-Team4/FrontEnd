import React from 'react';
import styles from './Menu.module.css';
import MenuSection from './MenuSection';

const MENU_SECTIONS = [
  {
    title: '나의 소비데이터 기반 카드추천',
    items: [
      '나의 소비데이터 기반 카드를 추천해줘',
      '(로그인 기반 값 불러오기)대에게 가장 인기 있는 카드를 추천해줘',
    ],
  },
  {
    title: '용어 질문하기',
    items: [
      '연회비가 무엇인가요?',
      '신용카드 발급 과정을 알려주세요.',
    ],
  },
  {
    title: '카드 상품 혜택 기반 추천',
    items: [
      '카드의 정석2 혜택 알려줘.',
      '편의점 혜택이 있는 카드들을 알려줘.',
    ],
  },
  {
    title: '카드 상품 혜택 기반 추천',
    items: [
      '카드의 정석2 혜택 알려줘.',
      '편의점 혜택이 있는 카드들을 알려줘.',
    ],
  },
  {
    title: '카드 상품 혜택 기반 추천',
    items: [
      '카드의 정석2 혜택 알려줘.',
      '편의점 혜택이 있는 카드들을 알려줘.',
    ],
  },
];

function Menu({ isOpen, onClose, bottomOffset = 0, onQuestionSelect }) {
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
        <div className={styles.panelHeader}>
          <span className={styles.dragHandle} />
          <p className={styles.panelSubtitle}>필요한 도움을 빠르게 선택하세요</p>
        </div>
        <div className={styles.sectionContainer}>
          {MENU_SECTIONS.map((section) => (
            <MenuSection
              key={section.title}
              title={section.title}
              items={section.items}
              onSelect={(question) => {
                const shouldClose = onQuestionSelect
                  ? onQuestionSelect(question) !== false
                  : true;
                if (shouldClose) {
                  onClose();
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu;
