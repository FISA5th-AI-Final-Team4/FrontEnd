import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage';
import styles from './ChatPage.module.css'; // ChatPage용 스타일

function ChatPage() {
  // 1. 기존 메시지 + 새 메시지를 관리할 state
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 우리 카드 챗봇입니다.', sender: 'bot' },
    { id: 2, text: '이번 달 혜택이 좋은 카드가 있을까요?', sender: 'user' },
    { id: 3, text: '네, 고객님! 선호하시는 혜택 분야가 있으신가요?', sender: 'bot' },
    { id: 4, text: '긴 텍스트 출력 테스트입니다. 이 텍스트는 말풍선의 크기를 테스트하기 위해 작성되었습니다.', sender: 'user' }
  ]);

  // 2. 입력창의 현재 텍스트를 관리할 state
  const [newMessage, setNewMessage] = useState('');

  // 3. 메시지 목록 DOM에 접근하기 위한 ref (자동 스크롤용)
  const messageListRef = useRef(null);

  // 4. messages 배열이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. 입력창 텍스트 변경 핸들러
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  // 6. 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault(); // Form 태그의 기본 동작(새로고침) 방지
    
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return; // 빈 메시지 전송 방지

    // 새 사용자 메시지 추가
    const userMessage = {
      id: Date.now(), // 고유 ID로 현재 시간 사용
      text: trimmedMessage,
      sender: 'user',
    };
    
    // state 업데이트 (기존 메시지 + 새 메시지)
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // 입력창 비우기
    setNewMessage('');

    // --- 봇 응답 시뮬레이션 (나중에 API 연동으로 대체) ---
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `"${trimmedMessage}"(이)라고 말씀하셨네요.`,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000); // 1초 후 응답
  };

  return (
    <div className={styles.chatWindow}>
      {/* 메시지 목록에 ref 연결 
      */}
      <div className={styles.messageList} ref={messageListRef}>
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            text={msg.text} 
            sender={msg.sender} 
          />
        ))}
      </div>
      
      {/* 메시지 입력창 (form으로 감싸서 Enter 키로도 전송 가능)
      */}
      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.inputField}
          value={newMessage}
          onChange={handleInputChange}
          placeholder="메시지를 입력하세요..."
          autoComplete="off"
        />
        <button type="submit" className={styles.sendButton}>
          전송
        </button>
      </form>
    </div>
  );
}

export default ChatPage;