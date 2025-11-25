import React, { useEffect, useMemo, useState } from 'react';
import styles from './Menu.module.css';
import MenuSection from './MenuSection';

const STATIC_SECTIONS = {
  consumption: {
    title: '나의 소비데이터 기반 카드추천',
    items: [
      '나의 소비데이터 기반 카드를 추천해줘',
      '(로그인 기반 값 불러오기)대에게 가장 인기 있는 카드를 추천해줘',
    ],
  },
  benefits: {
    title: '카드 상품 혜택 기반 추천',
    items: [
      '카드의 정석2 혜택 알려줘.',
      '편의점 혜택이 있는 카드들을 알려줘.',
    ],
  }
};

function Menu({ isOpen, onClose, bottomOffset = 0, onQuestionSelect }) {
  const [faqItems, setFaqItems] = useState([]);
  const [termItems, setTermItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/qna/faq?top_k=3');
        if (!response.ok) {
          throw new Error('Failed to fetch FAQ items');
        }
        const data = await response.json();
        if (!isMounted) {
          return;
        }
        setFaqItems(
          (Array.isArray(data) ? data : [])
            .map((item) => item?.question)
            .filter(Boolean)
        );
      } catch (error) {
        console.error('Unable to load FAQ list', error);
      }
    };

    const fetchTerms = async () => {
      try {
        const response = await fetch('/api/qna/terms?top_k=6');
        if (!response.ok) {
          throw new Error('Failed to fetch term items');
        }
        const data = await response.json();
        if (!isMounted) {
          return;
        }
        setTermItems(
          (Array.isArray(data) ? data : [])
            .map((item) => item?.term)
            .filter(Boolean)
        );
      } catch (error) {
        console.error('Unable to load term list', error);
      }
    };

    fetchFaqs();
    fetchTerms();

    return () => {
      isMounted = false;
    };
  }, []);

  const menuSections = useMemo(
    () => [
      STATIC_SECTIONS.consumption,
      {
        title: '자주 물어보는 질문',
        items: faqItems,
      },
      {
        title: '자주 물어보는 용어',
        items: termItems,
        layout: 'grid',
      },
      STATIC_SECTIONS.benefits,
    ],
    [faqItems, termItems]
  );

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
          {menuSections.map((section, index) => (
            <MenuSection
              key={`${section.title}-${index}`}
              title={section.title}
              items={section.items}
              layout={section.layout}
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
