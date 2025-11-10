import React from 'react';
import styles from './ChatHeader.module.css';
import arrowLeftIcon from '../assets/icons/arrow-left.svg';
import refreshIcon from '../assets/icons/refresh.svg';

/**
 * ChatPage 전용 헤더
 * @param {object} props
 * @param {function} props.onBack - 뒤로가기 버튼 클릭 시 호출될 함수
 * @param {function} props.onReconnect - 세션 재수립 버튼 클릭 시 호출될 함수
 */
function ChatHeader({ onBack, onReconnect }) {
  return (
    <header className={styles.chatHeader}>
      <button onClick={onBack} className={styles.navButton}>
        <img src={arrowLeftIcon} alt="뒤로가기" className={styles.logoImage} />
      </button>
      
      {/* 중앙 로고: 텍스트 대신 <img> 태그를 사용할 수 있습니다.
        <img src="/path/to/your/logo.png" alt="Logo" className={styles.logoImage} /> 
      */}
      <div className={styles.logo}>
        챗봇의 정석
      </div>

      <button onClick={onReconnect} className={styles.navButton}>
        <img src={refreshIcon} alt="새로고침" className={styles.logoImage} /> 
      </button>
    </header>
  );
}

export default ChatHeader;