import React from 'react';
import styles from './ChatMessage.module.css';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.warn('Invalid timestamp provided to ChatMessage:', err);
    return '';
  }
};

/**
 * 채팅 메시지 말풍선 컴포넌트
 * @param {object} props
 * @param {string} props.text - 메시지 내용
 * @param {string} props.sender - 보낸 사람 ('user' 또는 'bot')
 * @param {boolean} [props.isTyping] - 로딩 중 여부
 * @param {string} [props.timestamp] - ISO 문자열 등 표시할 시간
 */
function ChatMessage({ text, sender, isTyping = false, timestamp }) {
  // sender에 따라 'user' 또는 'bot' 스타일을 동적으로 적용
  const messageClass = sender === 'user' ? styles.user : styles.bot;
  const formattedTimestamp = formatTimestamp(timestamp);

  const bubbleContent = isTyping ? (
    <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  ) : (
    <div className={styles.messageBubble}>
      {text}
    </div>
  );

  return (
    <div className={`${styles.messageRow} ${messageClass}`}>
      <div className={styles.messageContent}>
        {bubbleContent}
        {!isTyping && formattedTimestamp && (
          <div className={styles.timestamp}>
            {formattedTimestamp}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
