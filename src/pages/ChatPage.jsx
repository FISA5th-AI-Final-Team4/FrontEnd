import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 import
import ChatMessage from '../components/ChatMessage';
import styles from './ChatPage.module.css';

function ChatPage() {
  const [messages, setMessages] = useState([]); // 1. 초기 메시지를 비웁니다.
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false); // 2. 연결 상태 추가
  
  const ws = useRef(null); // WebSocket 객체를 저장할 ref
  const messageListRef = useRef(null);
  const navigate = useNavigate(); // 페이지 이동 훅

  // 4. messages 배열이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');

    // 세션 ID가 없으면 페르소나 선택 페이지로 돌려보냄
    if (!sessionId) {
      alert('세션이 만료되었거나 유효하지 않습니다. 페르소나 선택 페이지로 돌아갑니다.');
      navigate('/'); 
      return;
    }

    // VITE_API_URL (http://...)을 ws:// 또는 wss:// 로 변환
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
    
    // WebSocket 객체 생성
    const socket = new WebSocket(`${wsUrl}/api/chat/ws/${sessionId}`);
    ws.current = socket; // ref에 WebSocket 객체 저장

    // WebSocket 이벤트 핸들러
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // 서버가 연결 직후 환영 메시지를 보내줄 것입니다.
    };

    socket.onmessage = (event) => {
      // 서버(봇)로부터 메시지 수신
      const botMessage = {
        id: Date.now(),
        text: event.data,
        sender: 'bot',
      };
      // 함수형 업데이트를 사용해야 최신 state를 참조할 수 있습니다.
      setMessages(prevMessages => [...prevMessages, botMessage]);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('채팅 서버에 연결할 수 없습니다.'); // 오류 상태 추가 (필요시)
    };

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [navigate]); // navigate를 의존성 배열에 추가

  // 5. 입력창 텍스트 변경 핸들러 (동일)
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  // 6. [수정] 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !isConnected) return; // 연결 안됐거나 빈 메시지 방지

    // 새 사용자 메시지 객체
    const userMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'user',
    };
    
    // 사용자 메시지를 즉시 UI에 추가
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // [수정] WebSocket을 통해 서버로 메시지 전송
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(trimmedMessage);
    } else {
      console.error('WebSocket is not connected.');
    }

    setNewMessage(''); // 입력창 비우기
    
    // [제거] 봇 응답 시뮬레이션 setTimeout 제거
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList} ref={messageListRef}>
        {/* 연결 상태 표시 (선택 사항) */}
        {!isConnected && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>
            채팅 서버에 연결 중...
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            text={msg.text} 
            sender={msg.sender} 
          />
        ))}
      </div>
      
      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.inputField}
          value={newMessage}
          onChange={handleInputChange}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
          autoComplete="off"
          disabled={!isConnected} // 7. 연결 안됐으면 비활성화
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!isConnected} // 7. 연결 안됐으면 비활성화
        >
          전송
        </button>
      </form>
    </div>
  );
}

export default ChatPage;