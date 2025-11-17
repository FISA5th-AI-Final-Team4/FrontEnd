import React from 'react';
import styles from './ChatMessage.module.css';
import ReactMarkdown from 'react-markdown';
import thumbsUpIcon from '../assets/icons/thumbs-up.svg';
import thumbsDownIcon from '../assets/icons/thumbs-down.svg';
import thumbsUpBlueIcon from '../assets/icons/thumbs-up-blue.svg';
import thumbsDownBlueIcon from '../assets/icons/thumbs-down-red.svg';

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
 * @param {boolean} [props.showFeedback] - 피드백 UI 노출 여부
 * @param {string} [props.feedbackValue] - 'up' | 'down' | undefined
 * @param {boolean} [props.feedbackDisabled] - 피드백 버튼 비활성화 여부
 * @param {(isHelpful: boolean) => void} [props.onFeedback] - 피드백 전송 콜백
 */
function ChatMessage({
  text,
  sender,
  isTyping = false,
  timestamp,
  showFeedback = false,
  feedbackValue,
  feedbackDisabled = false,
  onFeedback,
}) {
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
      <ReactMarkdown>
        {text}
      </ReactMarkdown>
    </div>
  );

  const shouldShowMeta = !isTyping && (showFeedback || formattedTimestamp);

  return (
    <div className={`${styles.messageRow} ${messageClass}`}>
      <div className={styles.messageContent}>
        {bubbleContent}
        {shouldShowMeta && (
          <div className={styles.metaRow}>
            {showFeedback && (
              <div className={styles.feedbackRow}>
                <button
                  type="button"
                  className={`${styles.feedbackButton} ${feedbackValue === 'up' ? styles.active : ''}`}
                  onClick={() => onFeedback?.(true)}
                  disabled={feedbackDisabled}
                  aria-label="유용했어요"
                >
                  <img
                    src={feedbackValue === 'up' ? thumbsUpBlueIcon : thumbsUpIcon}
                    alt="엄지 위"
                  />
                </button>
                <button
                  type="button"
                  className={`${styles.feedbackButton} ${feedbackValue === 'down' ? styles.active : ''}`}
                  onClick={() => onFeedback?.(false)}
                  disabled={feedbackDisabled}
                  aria-label="별로였어요"
                >
                  <img
                    src={feedbackValue === 'down' ? thumbsDownBlueIcon : thumbsDownIcon}
                    alt="엄지 아래"
                  />
                </button>
              </div>
            )}
            {formattedTimestamp && (
              <div className={styles.timestamp}>
                {formattedTimestamp}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
