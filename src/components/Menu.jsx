import React, { useEffect, useMemo, useState, useRef } from 'react';
import styles from './Menu.module.css';
import MenuSection from './MenuSection';

const STATIC_SECTIONS = {
  benefits: {
    title: '카드 상품 혜택 조회',
    variant: 'benefits',
    items: [
      '카드의 정석2와 카드의정석 EVERY 1 혜택 알려줘',
      '카드의 정석2의 혜택과 이용조건에 대해서 알려줘'
    ],
  },
  recommendations: {
    title: '맞춤형 카드 추천',
    variant: 'recommendations',
    items: [
      '편의점/카페/배달 위주로 할인 많이 받는 카드 추천해줘.',
      '내년에 일본 여행 갈건데, 여행 위주로 할인을 많이 받을 수 있는 카드를 추천해줘'
    ],
  },
  consumption: {
    title: '나의 소비데이터 기반 카드추천',
    variant: 'consumption',
    items: [
      '내 소비 패턴에 맞는 카드를 추천해줘'
    ],
  }
};

function Menu({ isOpen, onClose, bottomOffset = 0, onQuestionSelect }) {
  const [faqItems, setFaqItems] = useState([]);
  const [termItems, setTermItems] = useState([]);
  const overlayRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        const response = await fetch(`${apiBase}/api/qna/faq?top_k=3`);
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
        const response = await fetch(`${apiBase}/api/qna/terms?top_k=6`);
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
      STATIC_SECTIONS.recommendations,
      STATIC_SECTIONS.benefits,
      STATIC_SECTIONS.consumption,
      {
        title: '자주 물어보는 질문',
        items: faqItems,
        variant: 'faq',
      },
      {
        title: '자주 물어보는 용어',
        items: termItems,
        layout: 'grid',
        variant: 'terms',
        itemAlignment: 'center',
      },
    ],
    [faqItems, termItems]
  );

  const overlayStyle = bottomOffset
    ? { bottom: `${bottomOffset}px` }
    : undefined;

  useEffect(() => {
    if (isOpen || typeof document === 'undefined') {
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement && overlayRef.current?.contains(activeElement)) {
      activeElement.blur();
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
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
              variant={section.variant}
              layout={section.layout}
              itemAlignment={section.itemAlignment}
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
