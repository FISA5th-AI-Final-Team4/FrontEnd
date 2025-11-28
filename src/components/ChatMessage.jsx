import React from 'react';
import styles from './ChatMessage.module.css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import thumbsUpIcon from '../assets/icons/thumbs-up.svg';
import thumbsDownIcon from '../assets/icons/thumbs-down.svg';
import thumbsUpBlueIcon from '../assets/icons/thumbs-up-blue.svg';
import thumbsDownBlueIcon from '../assets/icons/thumbs-down-red.svg';
import LoginBubble from './LoginBubble';
import CardListBubble from './CardListBubble';
import QuestionBubble from './QuestionBubble';

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
 * @param {object} [props.payload] - 서버에서 전달된 추가 UI 데이터
 * @param {Array} [props.personaOptions] - 로그인 선택 옵션 목록
 * @param {(persona: object) => void} [props.onPersonaSelect] - 로그인 선택 콜백
 * @param {(question: string) => void} [props.onQuickQuestion] - 관련 질문 클릭 시 콜백
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
  payload,
  personaOptions = [],
  onPersonaSelect,
  hideLoginUI = false,
  onQuickQuestion,
}) {
  // sender에 따라 'user' 또는 'bot' 스타일을 동적으로 적용
  const messageClass = sender === 'user' ? styles.user : styles.bot;
  const formattedTimestamp = formatTimestamp(timestamp);

  const personaChoices = Array.isArray(personaOptions) ? personaOptions : [];
  const shouldShowLogin = !hideLoginUI && Boolean(payload?.login_required);
  const cardList = payload?.card_list || payload?.cards || [];
  const relatedQuestions = payload?.related_questions || payload?.faq_questions || [];

  const bubbleContent = isTyping ? (
    <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  ) : (
    <div className={styles.messageBubble}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // del(취소선) 태그가 감지되면, 내용(children) 앞뒤에 '~~' 문자를 붙여서 렌더링
          del: ({ children }) => <>{`~${children}~`}</>
        }}>
        {text}
      </Markdown>
    </div>
  );

  const shouldShowMeta = !isTyping && (showFeedback || formattedTimestamp);
  const hasCardList = Array.isArray(cardList) && cardList.length > 0;
  const hasRelatedQuestions = Array.isArray(relatedQuestions) && relatedQuestions.length > 0;
  const hasExtra =
    sender === 'bot' &&
    !isTyping &&
    (shouldShowLogin || hasCardList || hasRelatedQuestions);

  return (
    <div className={`${styles.messageRow} ${messageClass}`}>
      <div className={styles.messageContent}>
        {bubbleContent}
        {hasExtra && (
          <div className={styles.extraContent}>
            {shouldShowLogin && (
              <LoginBubble personas={personaChoices} onSelect={onPersonaSelect} />
            )}
            {hasCardList && (
              <CardListBubble cards={cardList} />
            )}
            {hasRelatedQuestions && (
              <QuestionBubble questions={relatedQuestions} onSelect={onQuickQuestion} />
            )}
          </div>
        )}
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
