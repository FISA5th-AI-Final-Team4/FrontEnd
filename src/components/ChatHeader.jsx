import React from 'react';
import styles from './ChatHeader.module.css';
import wooriLogo from '../assets/images/woori-logo.png';
import refreshIcon from '../assets/icons/refresh.svg';

/**
 * ChatPage 전용 헤더
 * @param {object} props
 * @param {function} props.onBack - 뒤로가기 버튼 클릭 시 호출될 함수
 * @param {function} props.onReconnect - 세션 재수립 버튼 클릭 시 호출될 함수
 */
function ChatHeader({ onReconnect }) {
  return (
    <header className={styles.chatHeader}>
      <img src={wooriLogo} alt="우리금융계열 로고" className={styles.logoImage} />
      
      <div className={styles.logo}>
        챗봇의 정석
      </div>

      <button
        onClick={(e) => {
          const btn = e.currentTarget;
          btn.classList.remove(styles.spin);
          void btn.offsetWidth; // reflow to restart animation
          btn.classList.add(styles.spin);
          setTimeout(() => btn.classList.remove(styles.spin), 600);
          onReconnect?.();
        }}
        className={`${styles.navButton} ${styles.refreshButton}`}
        aria-label="새로고침"
      >
        <img src={refreshIcon} alt="새로고침"/> 
      </button>
    </header>
  );
}

export default ChatHeader;
