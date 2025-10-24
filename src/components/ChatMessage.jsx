import React from 'react';
import styles from './ChatMessage.module.css';

/**
 * 채팅 메시지 말풍선 컴포넌트
 * @param {object} props
 * @param {string} props.text - 메시지 내용
 * @param {string} props.sender - 보낸 사람 ('user' 또는 'bot')
 */
function ChatMessage({ text, sender }) {
  // sender에 따라 'user' 또는 'bot' 스타일을 동적으로 적용
  const messageClass = sender === 'user' ? styles.user : styles.bot;

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