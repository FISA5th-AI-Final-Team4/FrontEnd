import React from 'react';
import styles from './ChatMessage.module.css';

/**
 * 채팅 메시지 말풍선 컴포넌트
 * - 'message' 객체를 받아, 'type'에 따라 텍스트, JSON, 에러를 분기하여 렌더링합니다.
 * * @param {object} props
 * @param {object} props.message - 메시지 객체
 * @param {string} props.message.type - 'text', 'json', 'error'
 * @param {string} props.message.sender - 'user' 또는 'bot'
 * @param {string} [props.message.text] - 텍스트 내용
 * @param {object} [props.message.jsonData] - JSON 데이터 (type='json'일 때)
 * @param {boolean} [props.message.isError] - (선택) 에러 여부
 */
function ChatMessage({ message }) {
  // 1. message prop에서 필요한 속성들을 구조분해합니다.
  const { sender, type, text, jsonData, isError } = message;

  // 2. JSON 타입 렌더링
  if (type === 'json') {
    return (
      <div className={`${styles.messageRow} ${styles.bot}`}>
        <div className={styles.messageBubble}>
          <strong style={{ display: 'block', marginBottom: '10px' }}>
            [Tool 결과]
          </strong>
          {/* 이 컴포넌트의 CSS 파일(ChatMessage.module.css)에 
            .jsonViewer 스타일이 정의되어 있어야 합니다.
          */}
          <pre className={styles.jsonViewer}>
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // 3. 에러 타입 렌더링
  if (type === 'error' || isError) {
    // .errorMessage 클래스를 ChatMessage.module.css에 정의했다고 가정합니다.
    return (
      <div className={`${styles.messageRow} ${styles.bot} ${styles.errorMessage}`}>
        <div className={styles.messageBubble}>
          {`[오류] ${text}`}
        </div>
      </div>
    );
  }

  // 4. 기본 텍스트 타입 렌더링 (user 또는 bot)
  // (기존 ChatMessage 로직)
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