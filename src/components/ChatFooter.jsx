import React, { useState } from 'react';
import styles from './ChatFooter.module.css';
import menuIcon from '../assets/icons/menu.svg';
import sendIcon from '../assets/icons/send.svg';

/**
 * ChatPage 전용 푸터
 * @param {object} props
 * @param {boolean} props.isInputDisabled - 입력 필드가 비활성화되었는지 여부
 * @param {boolean} props.isStreaming - 봇이 응답을 스트리밍 중인지 여부
 * @param {object} props.inputRef - 입력 필드에 대한 참조
 * @param {function} props.onSend - 메시지 전송을 처리하는 함수, 성공 시 true 반환
 */
function ChatFooter({ isInputDisabled, isStreaming, inputRef, onSend }) {
    const [newMessage, setNewMessage] = useState(''); // 입력창의 현재 텍스트

    const handleMenuClick = () => {
        alert('메뉴 버튼을 눌렀습니다.');
    };

    // 메시지 입력 폼 제출(전송) 시 실행됩니다.
    const handleSubmit = (e) => {
        e.preventDefault(); // 폼의 기본 새로고침 동작 방지
        const trimmed = newMessage.trim(); // 입력값의 앞뒤 공백 제거

        // 메시지가 비어있거나, 전송버튼이 활성화되지 않았으면 전송하지 않음
        if (!trimmed || isInputDisabled) return;
        
        // 부모 컴포넌트로 메시지 전송
        const didSend = onSend(trimmed);
        if (didSend) {
            setNewMessage('');
        }
    };

    return (
        <div className={styles.inputArea}>
            <button
                type="button"
                className={styles.menuButton}
                onClick={handleMenuClick}
                aria-label="메뉴 열기"
            >
                <img src={menuIcon} alt="메뉴" className={styles.icon} />
            </button>
            <form className={styles.messageForm} onSubmit={handleSubmit}>
                {/* 메세지 입력 필드 */}
                <input
                    type="text"
                    className={styles.inputField}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                        isInputDisabled
                            ? (isStreaming ? "봇이 응답 중입니다..." : "연결 중...")
                            : "메시지를 입력하세요..."
                    }
                    autoComplete="off"
                    disabled={isInputDisabled}
                    ref={inputRef}
                />
                {/* 전송 버튼 */}
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={isInputDisabled}
                >
                    <img src={sendIcon} alt="전송" className={styles.icon} /> 
                </button>
            </form>
        </div>
    );
}

export default ChatFooter;
