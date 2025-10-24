import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ChatHeader from '../components/ChatHeader'; 
import styles from './ChatPage.module.css';


/**
 * 실시간 채팅 페이지 컴포넌트
 * - WebSocket을 통해 서버와 실시간으로 메시지를 주고받습니다.
 * - ChatHeader를 통해 세션 관리(뒤로가기, 재연결) 기능을 제공합니다.
 */
function ChatPage() {
  // --- 상태 관리 (State) ---
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [newMessage, setNewMessage] = useState(''); // 입력창의 현재 텍스트
  const [isConnected, setIsConnected] = useState(false); // WebSocket 연결 상태 (UI 비활성화/메시지 표시용)
  const [isReconnecting, setIsReconnecting] = useState(false); // '재연결' 버튼 클릭 시 로딩 상태
  
  // --- 참조 관리 (Refs) ---
  const ws = useRef(null); // WebSocket 인스턴스는 리렌더링 시에도 유지되어야 하므로 ref로 관리합니다.
  const messageListRef = useRef(null); // 메시지 목록 DOM 엘리먼트에 접근해 스크롤을 제어하기 위한 ref입니다.
  const didMountRef = useRef(false); // React 18의 Strict Mode(개발 모드)에서 이중 마운트를 감지하기 위한 ref입니다.
  
  // React Router의 페이지 이동(리다이렉트)용 훅입니다.
  const navigate = useNavigate();

  // 자동 스크롤 로직
  // 새 메시지가 `messages` 상태에 추가될 때마다, 메시지 목록의 스크롤을 맨 아래로 이동시킵니다.
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * WebSocket 연결을 설정하고 이벤트 핸들러를 바인딩하는 핵심 함수입니다.
   * `useCallback`으로 감싸, `useEffect` 의존성 배열에 사용될 때
   * 불필요한 함수 재생성을 방지합니다.
   */
  const connectWebSocket = useCallback(() => {
    // localStorage에서 세션 ID를 가져옵니다.
    const sessionId = localStorage.getItem('sessionId');
    
    // 세션 ID가 없으면 채팅방에 진입할 수 없으므로, 선택 페이지로 리다이렉트합니다.
    if (!sessionId) {
      alert('세션이 없습니다. 페르소나 선택으로 돌아갑니다.');
      navigate('/');
      return;
    }

    console.log('Attempting to connect WebSocket...');
    setIsConnected(false); // 연결 시도 전 상태를 '연결 끊김'으로 설정
    // VITE_API_URL (http:// 또는 https://)을 WebSocket 프로토콜(ws:// 또는 wss://)로 변환합니다.
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
    // 서버의 WebSocket 엔드포인트로 연결을 시도합니다.
    const socket = new WebSocket(`${wsUrl}/api/chat/ws/${sessionId}`);
    ws.current = socket; // 생성된 소켓 인스턴스를 ref에 저장하여 컴포넌트 전역에서 참조할 수 있게 합니다.

    // --- WebSocket 이벤트 핸들러 ---

    // 연결 성공 시
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true); // 연결 상태 true
      setIsReconnecting(false); // 재연결 중이었다면 로딩 상태 해제
    };

    // 서버로부터 메시지 수신 시
    socket.onmessage = (event) => {
      // 봇(서버)이 보낸 메시지를 객체로 가공합니다.
      const botMessage = { id: Date.now(), text: event.data, sender: 'bot' };
      // 메시지 목록(state)에 새 메시지를 추가합니다. (함수형 업데이트)
      setMessages(prevMessages => [...prevMessages, botMessage]);
    };

    // 연결 종료 시
    socket.onclose = (event) => { // line 55
      console.log('WebSocket disconnected', event.code);
      setIsConnected(false); // 연결 상태 false

      // 서버가 정의한 '유효하지 않은 세션' 코드(4001)로 연결이 종료된 경우
      if (event.code === 4001) {
        alert('세션이 유효하지 않습니다. 페르소나 선택 페이지로 돌아갑니다.');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('selectedPersonaId');
        navigate('/'); // 페르소나 선택 페이지로 리다이렉트
      }
    };

    // 에러 발생 시
    socket.onerror = (error) => { // line 67
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setIsReconnecting(false); // 재연결 중 에러가 나도 로딩 상태 해제
    };

  }, [navigate]); // navigate 함수는 변경되지 않지만, ESLint 규칙에 따라 의존성에 포함

  /**
   * 컴포넌트 마운트 시 WebSocket 연결을 설정하고, 언마운트 시 연결을 정리합니다.
   * React 18의 Strict Mode(개발 모드) 대응 로직이 포함되어 있습니다.
   */
  useEffect(() => {
    // --- React 18 Strict Mode (개발 모드) 대응 로직 ---
    // 개발 모드에서는 컴포넌트가 마운트->언마운트->재마운트 되며 이 useEffect가 2번 실행됩니다.
    // 이 로직은 첫 번째(가짜) 마운트를 didMountRef.current를 사용해 무시하고,
    // 두 번째(실제) 마운트에서만 connectWebSocket을 실행하도록 합니다.
    // 참고: https://react.dev/reference/react/StrictMode
    if (process.env.NODE_ENV === 'development') {
      if (didMountRef.current) {
        // 두 번째 마운트(실제 마운트): 연결 실행
        connectWebSocket();
      } else {
        // 첫 번째 마운트(가짜 마운트): ref만 true로 설정하고 종료
        didMountRef.current = true;
        return; // 여기서 effect 종료
      }
    } else {
      connectWebSocket(); // 운영 모드(production): 한 번만 실행되므로 바로 연결
    }
    // --- End of Strict Mode workaround ---

    // cleanup 함수:
    // 이 코드는 컴포넌트가 '진짜' 언마운트될 때 호출됩니다.
    // (Strict Mode의 '가짜' 언마운트 시에는 didMountRef가 false라 호출되지 않음)
    // -> [수정] Strict Mode의 가짜 언마운트 시에도 호출되지만, didMountRef.current가 false인 상태에서 실행됩니다.
    // -> [재수정] didMountRef.current가 true로 설정된 후, 가짜 언마운트가 발생하므로 cleanup이 실행됩니다.
    //    이 cleanup은 두 번째 마운트의 connectWebSocket 전에 실행되어야 하므로 필수적입니다.
    return () => {
      if (ws.current) {
        console.log(`Cleaning up WebSocket (state: ${ws.current.readyState})`); // line 82
        ws.current.close(); // 컴포넌트가 사라질 때 소켓 연결을 명시적으로 닫습니다.
      }
    };
  }, [connectWebSocket]); // connectWebSocket 함수가 재생성될 때만 이 effect가 다시 실행됩니다.

  // 헤더의 '뒤로가기' 버튼 클릭 시 실행됩니다.
  // 세션 정보를 삭제하고 메인 페이지로 이동합니다.
  const handleBack = () => {
    if (ws.current) {
      ws.current.close(); // 소켓 연결 해제
    }
    localStorage.removeItem('sessionId'); // 로컬 스토리지에서 세션 ID 제거
    localStorage.removeItem('selectedPersonaId'); // 페르소나 ID도 제거
    navigate('/'); // 메인 페이지로 리다이렉트
  };

  // 헤더의 '새로고침' 버튼 클릭 시 실행됩니다.
  // 기존 페르소나 ID로 새로운 세션을 요청하고, 새 세션으로 WebSocket을 다시 연결합니다.
  const handleReconnect = async () => {
    const personaId = localStorage.getItem('selectedPersonaId');
    if (!personaId) {
        alert('페르소나 정보가 없습니다. 선택 화면으로 돌아갑니다.');
        handleBack(); // 페르소나 ID가 없으면 '뒤로가기'와 동일하게 처리
        return;
    }
    
    // 새 연결을 시도하기 전에, 기존 연결을 명시적으로 닫습니다.
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log('Closing existing socket for reconnect...');
      ws.current.close();
    }
    
    console.log(`Re-establishing session for persona: ${personaId}`);
    setIsReconnecting(true); // 재연결 로딩 UI 활성화
    setMessages([]); // 새 세션이므로 기존 메시지 목록 비우기
    
    try {
      // 세션 생성 API를 다시 호출합니다. (PersonaSelectPage와 동일한 로직)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/session`, {
        method: 'POST',
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: personaId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new session');
      }

      const data = await response.json();
      localStorage.setItem('sessionId', data.session_id); // 새 세션 ID를 로컬 스토리지에  저장
      
      // 새 세션 ID로 WebSocket 연결을 다시 시도합니다.
      // 이 시점은 이미 마운트가 완료된 상태이므로 Strict Mode 우회 로직이 필요 없습니다.
      connectWebSocket(); 

    } catch (err) {
      console.error(err);
      alert('세션 재수립에 실패했습니다.');
      setIsReconnecting(false); // 에러 발생 시 로딩 상태 해제
    }
  };

  // 메시지 입력 폼 제출(전송) 시 실행됩니다.
  const handleSendMessage = (e) => {
    e.preventDefault(); // 폼의 기본 새로고침 동작 방지
    const trimmedMessage = newMessage.trim(); // 입력값의 앞뒤 공백 제거
    if (!trimmedMessage || !isConnected) return; // 메시지가 비어있거나, 소켓이 연결되지 않았으면 전송하지 않음

    // 사용자 메시지를 객체로 만듭니다.
    const userMessage = { id: Date.now(), text: trimmedMessage, sender: 'user' };
    // 사용자 메시지를 즉시 UI에 추가 (낙관적 업데이트)
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // WebSocket 연결이 'OPEN' 상태일 때만 서버로 메시지를 전송합니다.
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(trimmedMessage);
    } else {
      console.error('WebSocket is not connected.');
    }
    setNewMessage(''); // 입력창 비우기
  };

  // --- 렌더링 로직 ---

  // 재연결 또는 초기 연결 중일 때를 구분하기 위한 로딩 상태 변수
  const isLoading = !isConnected && isReconnecting;
  
  return (
    <div className={styles.chatWindow}>
      {/* ChatHeader에 핸들러 함수들을 props로 전달 */}
      <ChatHeader onBack={handleBack} onReconnect={handleReconnect} />
      
      {/* 메시지 목록 (자동 스크롤을 위해 ref 할당) */}
      <div className={styles.messageList} ref={messageListRef}>
        {/* 재연결 중일 때 로딩 메시지 */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            새로운 세션에 연결 중입니다...
          </div>
        )}
        {/* 초기 연결 중일 때 로딩 메시지 */}
        {!isReconnecting && !isConnected && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            채팅 서버에 연결 중...
          </div>
        )}
        
        {/* 메시지 목록을 순회하며 ChatMessage 컴포넌트 렌더링 */}
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            text={msg.text} 
            sender={msg.sender} 
          />
        ))}
      </div>
      
      {/* 메시지 입력 폼 */}
      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.inputField}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
          autoComplete="off"
          disabled={!isConnected || isLoading}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!isConnected || isLoading}
        >
          전송
        </button>
      </form>
    </div>
  );
}

export default ChatPage;