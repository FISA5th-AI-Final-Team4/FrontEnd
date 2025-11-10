import React from 'react';
import styles from './ChatMessage.module.css';

/**
 * 채팅 메시지 말풍선 컴포넌트
 * @param {object} props
 * @param {string} props.text - 메시지 내용
 * @param {string} props.sender - 보낸 사람 ('user' 또는 'bot')
 * @param {boolean} [props.isTyping] - 로딩 중 여부
 */
function ChatMessage({ text, sender, isTyping = false }) {
  // sender에 따라 'user' 또는 'bot' 스타일을 동적으로 적용
  const messageClass = sender === 'user' ? styles.user : styles.bot;

  // 로딩 중일 때는 애니메이션 점 3개를 표시
  if (isTyping) {
    return (
      <div className={`${styles.messageRow} ${messageClass}`}>
        <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
        </div>
      </div>
    );
  }

  // 일반 메시지 렌더링
  return (
    // styles.messageRow를 사용해 정렬을 처리
    <div className={`${styles.messageRow} ${messageClass}`}>
      <div className={styles.messageBubble}>
        {text}
      </div>
    </div>
  );
}

export default ChatMessage;