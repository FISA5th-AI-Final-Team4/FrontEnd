import React, { useMemo } from 'react';
import styles from './LoginBubble.module.css';

function normalizePersona(persona, fallbackIndex) {
  if (!persona) return null;
  if (typeof persona === 'string') {
    const trimmed = persona.trim();
    return {
      id: `persona-${fallbackIndex}`,
      name: trimmed || `프로필 ${fallbackIndex + 1}`,
    };
  }
  if (typeof persona === 'object') {
    const id =
      persona.id ??
      persona.persona_id ??
      persona.value ??
      `persona-${fallbackIndex}`;
    const name =
      persona.name ??
      persona.persona_name ??
      persona.label ??
      `프로필 ${fallbackIndex + 1}`;
    return { id, name };
  }
  return null;
}

function LoginBubble({ personas = [], onSelect }) {
  const normalized = useMemo(() => {
    if (!Array.isArray(personas)) {
      return [];
    }
    return personas
      .map((persona, index) => normalizePersona(persona, index))
      .filter(Boolean);
  }, [personas]);

  return (
    <div className={styles.container}>
      <p className={styles.title}>챗봇 이용을 위해 프로필을 선택해주세요.</p>

      {normalized.length === 0 ? (
        <p className={styles.emptyText}>
          선택 가능한 프로필 정보가 없습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : (
        <div className={styles.list}>
          {normalized.map((persona) => (
            <button
              key={persona.id}
              type="button"
              className={styles.personaButton}
              onClick={() => onSelect?.(persona)}
            >
              <span className={styles.personaName}>
                {persona.name ?? `ID ${persona.id}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoginBubble;
