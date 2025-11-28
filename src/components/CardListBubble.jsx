import React, { useMemo } from 'react';
import styles from './CardListBubble.module.css';
import cardIds from '../assets/card_ids.json';
import externalLinkIcon from '../assets/icons/external-link.svg';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/160x100?text=Card';
const WOORICARD_BASE_URL =
  'https://pc.wooricard.com/dcpc/yh1/crd/crd01/H1CRD101S02.do?cdPrdCd=';

const cardImageModules = import.meta.glob('../assets/cards/*', {
  eager: true,
  import: 'default',
});

const normalizeKey = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeLooseKey = (value) =>
  normalizeKey(value).replace(/[\s\-\_\+\&]/g, '');

const ensureCardName = (card, index) => {
  if (!card || typeof card !== 'object') {
    return `추천 카드 ${index + 1}`;
  }
  const candidates = [
    card.name,
    card.card_name,
    card.cardName,
    card.title,
    card.label,
    card.displayName,
  ];
  const found = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0,
  );
  return found ? found.trim() : `추천 카드 ${index + 1}`;
};

const toCardObject = (card, index) => {
  if (card && typeof card === 'object') {
    if (!card.name) {
      const guessedName = ensureCardName(card, index);
      return { ...card, name: guessedName };
    }
    return card;
  }
  if (typeof card === 'string') {
    const trimmed = card.trim();
    return {
      id: `card-${index}`,
      name: trimmed || `추천 카드 ${index + 1}`,
    };
  }
  return {
    id: `card-${index}`,
    name: `추천 카드 ${index + 1}`,
  };
};

const registerKey = (map, key, value) => {
  if (!key || map[key]) {
    return;
  }
  map[key] = value;
};

const cardImageMap = Object.entries(cardImageModules).reduce(
  (acc, [path, module]) => {
    const fileName = path.split('/').pop();
    if (!fileName) {
      return acc;
    }
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const primaryKey = normalizeKey(baseName);
    const looseKey = normalizeLooseKey(baseName);
    registerKey(acc, primaryKey, module);
    registerKey(acc, looseKey, module);
    return acc;
  },
  {},
);

const cardIdMap = Object.entries(cardIds).reduce((acc, [name, id]) => {
  const primaryKey = normalizeKey(name);
  const looseKey = normalizeLooseKey(name);
  registerKey(acc, primaryKey, id);
  registerKey(acc, looseKey, id);
  return acc;
}, {});

function CardListBubble({ cards = [] }) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }

  const resolvedCards = useMemo(() => {
    return cards.map((rawCard, index) => {
      const card = toCardObject(rawCard, index);
      const displayName = ensureCardName(card, index);
      const normalizedName = normalizeKey(displayName);
      const looseName = normalizeLooseKey(displayName);
      const matchedImage =
        cardImageMap[normalizedName] ?? cardImageMap[looseName] ?? null;
      const cardPageId =
        cardIdMap[normalizedName] ?? cardIdMap[looseName] ?? null;
      return {
        ...card,
        _displayName: displayName,
        _resolvedImage: matchedImage,
        _cardId: cardPageId,
        _fallbackKey: card.id ?? displayName ?? `card-${index}`,
      };
    });
  }, [cards]);

  const handleCardClick = (cardId) => {
    if (!cardId) {
      return;
    }
    const targetUrl = `${WOORICARD_BASE_URL}${cardId}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
        <p className={styles.title}>카드를 눌러 상세 정보를 확인해보세요.</p>
      <div className={styles.scroller}>
        {resolvedCards.map((card) => {
          const imageSrc =
            card._resolvedImage ||
            card.image_url ||
            card.image ||
            card.thumbnail ||
            PLACEHOLDER_IMAGE;
          const displayName = card._displayName ?? card.name ?? '추천 카드';
          return (
            <div className={styles.card} key={card._fallbackKey}>
              <button
                type="button"
                className={styles.cardImageButton}
                onClick={() => handleCardClick(card._cardId)}
                disabled={!card._cardId}
                aria-label={`${displayName} 카드 상세 페이지 열기`}
              >
                <img
                  src={imageSrc}
                  alt={displayName}
                  className={styles.cardImage}
                />
                {card._cardId && (
                  <img
                    src={externalLinkIcon}
                    alt="외부 링크"
                    className={styles.externalIcon}
                    aria-hidden="true"
                  />
                )}
              </button>
              <div className={styles.cardBody}>
                <p className={styles.cardName}>{displayName}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardListBubble;
