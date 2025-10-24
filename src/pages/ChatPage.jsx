import React, { useState } from 'react';
import ChatMessage from '../components/ChatMessage';
import styles from './ChatPage.module.css'; // ChatPage용 스타일

function ChatPage() {
  // 임시 채팅 메시지 데이터
  const [messages, setMessages] = useState([
    { id: 1, text: '안녕하세요! 우리 카드 챗봇입니다.', sender: 'bot' },
    { id: 2, text: '이번 달 혜택이 좋은 카드가 있을까요?', sender: 'user' },
    { id: 3, text: '네, 고객님! 선호하시는 혜택 분야가 있으신가요?', sender: 'bot' },
    { id: 4, text: '긴 텍스트 출력 테스트입니다. 이 텍스트는 말풍선의 크기를 테스트하기 위해 작성되었습니다.', sender: 'user' }
  ]);

  // ChatPage.module.css 에 .chatWindow, .messageList 등을 정의해야 합니다.
  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            text={msg.text} 
            sender={msg.sender} 
          />
        ))}
      </div>
      {/* TODO: 여기에 메시지 입력창 구현 */}
    </div>
  );
}

export default ChatPage;