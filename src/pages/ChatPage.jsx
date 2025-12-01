import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatHeader from '../components/ChatHeader'; 
import ChatFooter from '../components/ChatFooter';
import styles from './ChatPage.module.css';

const TYPING_INDICATOR_ID = 'bot-typing-indicator';
const INITIAL_BOT_MESSAGE_ID = 'bot-initial-message';
const INITIAL_BOT_MESSAGE_TEXT = [
  '안녕하세요, 고객님! 고객님께 딱 맞는 카드를 추천해드리는 우리카드 챗봇입니다.',
  '왼쪽 아래의 메뉴를 눌러 원하시는 질문을 고르거나 직접 입력해주세요.',
].join('\n');

const generateRandomIdValue = () => (
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const createClientMessageId = () => `msg-${generateRandomIdValue()}`;

/**
 * 실시간 채팅 페이지 컴포넌트
 * - WebSocket을 통해 서버와 실시간으로 메시지를 주고받습니다.
 * - ChatHeader를 통해 세션 관리(뒤로가기, 재연결) 기능을 제공합니다.
 */
function ChatPage() {
  // --- 상태 관리 (State) ---
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [isConnected, setIsConnected] = useState(false); // WebSocket 연결 상태 (UI 비활성화/메시지 표시용)
  const [isReconnecting, setIsReconnecting] = useState(false); // '재연결' 버튼 클릭 시 로딩 상태
  const [feedbackStatus, setFeedbackStatus] = useState({}); // messageId -> 'up' | 'down'
  const [feedbackLoading, setFeedbackLoading] = useState({}); // messageId -> boolean
  const [connectionError, setConnectionError] = useState(null);
  const [personaOptions, setPersonaOptions] = useState([]);
  const [hasFetchedPersonas, setHasFetchedPersonas] = useState(false);
  const [hasCompletedPersonaLogin, setHasCompletedPersonaLogin] = useState(false);

  // --- 참조 관리 (Refs) ---
  const ws = useRef(null); // WebSocket 인스턴스는 리렌더링 시에도 유지되어야 하므로 ref로 관리합니다.
  const messageListRef = useRef(null); // 메시지 목록 DOM 엘리먼트에 접근해 스크롤을 제어하기 위한 ref입니다.
  const inputRef = useRef(null);
  const didMountRef = useRef(false); // React 18의 Strict Mode(개발 모드)에서 이중 마운트를 감지하기 위한 ref입니다.
  const promptQueueRef = useRef([]); // 각 유저 메시지를 큐에 저장해, 이후 봇 응답과 매칭합니다.
  const personaFetchInProgressRef = useRef(false);
  const currentSessionIdRef = useRef(null);
  
  const resetToEntry = useCallback(() => {
    window.location.reload();
  }, []);

  const apiBase = import.meta.env.VITE_API_URL;

  // 자동 스크롤 로직
  // 새 메시지가 `messages` 상태에 추가될 때마다, 메시지 목록의 스크롤을 맨 아래로 이동시킵니다.
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const addTypingIndicator = useCallback(() => {
    setMessages(prevMessages => {
      if (prevMessages.some(msg => msg.id === TYPING_INDICATOR_ID)) {
        return prevMessages;
      }
      return [
        ...prevMessages,
        { id: TYPING_INDICATOR_ID, sender: 'bot', isTyping: true },
      ];
    });
  }, []);

  const removeTypingIndicator = useCallback(() => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== TYPING_INDICATOR_ID));
  }, []);

  const resolveSessionId = useCallback(() => {
    if (currentSessionIdRef.current) {
      return currentSessionIdRef.current;
    }
    if (typeof window !== 'undefined') {
      const legacy = window.localStorage?.getItem('sessionId');
      if (legacy) {
        currentSessionIdRef.current = legacy;
        return legacy;
      }
      const cookieMatch = document.cookie.match(/(?:^|;\s*)session_id=([^;]+)/);
      if (cookieMatch?.[1]) {
        const decoded = decodeURIComponent(cookieMatch[1]);
        currentSessionIdRef.current = decoded;
        return decoded;
      }
    }
    return null;
  }, []);

  const fetchPersonaOptions = useCallback(async () => {
    if (!apiBase || hasFetchedPersonas || personaFetchInProgressRef.current) {
      return;
    }
    personaFetchInProgressRef.current = true;
    try {
      const response = await fetch(`${apiBase}/api/chat/personas`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch persona list');
      }
      const data = await response.json();
      const personaPayload = Array.isArray(data?.personas)
        ? data.personas
        : Array.isArray(data)
          ? data
          : [];
      const normalized = personaPayload.map((persona, index) => ({
        id:
          persona?.id ??
          persona?.persona_id ??
          persona?.value ??
          `persona-${index}`,
        name:
          persona?.name ??
          persona?.persona_name ??
          persona?.label ??
          `프로필 ${index + 1}`,
      }));
      setPersonaOptions(normalized);
      setHasFetchedPersonas(true);
    } catch (err) {
      console.error('Failed to fetch persona options', err);
    } finally {
      personaFetchInProgressRef.current = false;
    }
  }, [apiBase, hasFetchedPersonas]);

  /**
   * WebSocket 연결을 설정하고 이벤트 핸들러를 바인딩하는 핵심 함수입니다.
   * `useCallback`으로 감싸, `useEffect` 의존성 배열에 사용될 때
   * 불필요한 함수 재생성을 방지합니다.
   */
  const connectWebSocket = useCallback(() => {
    console.log('Attempting to connect WebSocket...');
    setIsConnected(false); // 연결 시도 전 상태를 '연결 끊김'으로 설정
    setConnectionError(null);

    if (!apiBase) {
      console.error('API base URL is missing, cannot create WebSocket.');
      setConnectionError('API 서버 정보가 없습니다.');
      return;
    }

    const wsUrl = apiBase.replace(/^http/, 'ws');

    try {
      const socket = new WebSocket(`${wsUrl}/api/chat/ws`);
      ws.current = socket; // 생성된 소켓 인스턴스를 ref에 저장하여 컴포넌트 전역에서 참조할 수 있게 합니다.

      // --- WebSocket 이벤트 핸들러 ---

      // 연결 성공 시
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true); // 연결 상태 true
        setIsReconnecting(false); // 재연결 중이었다면 로딩 상태 해제
        setMessages(prev => {
          if (prev.some(msg => msg.id === INITIAL_BOT_MESSAGE_ID)) {
            return prev;
          }
          const initialMessage = {
            id: INITIAL_BOT_MESSAGE_ID,
            text: INITIAL_BOT_MESSAGE_TEXT,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            disableFeedback: true,
          };
          return [...prev, initialMessage];
        });
      };

      // 서버로부터 메시지 수신 시
      socket.onmessage = (event) => {
        let parsedPayload;
        
        try {
          parsedPayload = JSON.parse(event.data);
        } catch (err) {
          console.warn('Failed to parse WebSocket payload, falling back to plain text.', err);
        }

        if (parsedPayload?.session_id) {
          const newSessionId = parsedPayload.session_id;
          currentSessionIdRef.current = newSessionId;
          try {
            window.localStorage?.setItem('sessionId', newSessionId);
          } catch (storageErr) {
            console.warn('Failed to persist sessionId to localStorage', storageErr);
          }

          if (!parsedPayload?.message && !parsedPayload?.tool_response) {
            return;
          }
        }

        const promptContext = promptQueueRef.current.shift();
        const requiresLogin = Boolean(parsedPayload?.login_required);
        if (requiresLogin) {
          fetchPersonaOptions();
        }

        const serverMessageId = parsedPayload?.message_id ?? generateRandomIdValue();
        const botMessage = {
          id: createClientMessageId(),
          serverMessageId,
          text: parsedPayload?.message ?? event.data,
          sender: parsedPayload?.sender === 'user' ? 'user' : 'bot',
          timestamp: parsedPayload?.timestamp ?? new Date().toISOString(),
          promptMessageId: promptContext?.serverMessageId ?? promptContext?.id,
          payload: parsedPayload,
        }
        console.log('Received message via WebSocket:', botMessage);

        // 기존 로딩 버블을 제거한 뒤 봇 메시지를 추가합니다. (함수형 업데이트)
        setMessages(prevMessages => {
          const withoutTyping = prevMessages.filter(msg => msg.id !== TYPING_INDICATOR_ID);
          return [...withoutTyping, botMessage];
        });
      };

      // 연결 종료 시
      socket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code);
        setIsConnected(false); // 연결 상태 false
        removeTypingIndicator(); // 연결이 끊기면 로딩 버블 제거
      };

      // 에러 발생 시
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsReconnecting(false); // 재연결 중 에러가 나도 로딩 상태 해제
        setConnectionError('채팅 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        removeTypingIndicator();
      };
    } catch (err) {
      console.error('WebSocket instantiation failed', err);
      setConnectionError('웹소켓 연결을 시작할 수 없습니다.');
    }

  }, [apiBase, fetchPersonaOptions, removeTypingIndicator]);

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
      removeTypingIndicator();
    };
  }, [connectWebSocket, removeTypingIndicator]); // connectWebSocket 함수가 재생성될 때만 이 effect가 다시 실행됩니다.

  const handleBack = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
    promptQueueRef.current = [];
    resetToEntry();
  }, [resetToEntry]);

  // 헤더의 '새로고침' 버튼 클릭 시 실행됩니다.
  // 기존 페르소나 ID로 새로운 세션을 요청하고, 새 세션으로 WebSocket을 다시 연결합니다.
  const handleReconnect = () => {
    // 새 연결을 시도하기 전에, 기존 연결을 명시적으로 닫습니다.
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log('Closing existing socket for reconnect...');
      ws.current.close();
    }
    
    console.log('Re-establishing chat session');
    setIsReconnecting(true); // 재연결 로딩 UI 활성화
    removeTypingIndicator();
    setMessages([]); // 새 연결이므로 기존 메시지 목록 비우기
    setFeedbackStatus({});
    setFeedbackLoading({});
    setHasCompletedPersonaLogin(false);
    promptQueueRef.current = [];

    connectWebSocket();
  };

  // 메시지 전송 핸들러 (ChatFooter에서 사용)
  const handleSendMessage = useCallback((messageText) => {
    const trimmedMessage = messageText.trim(); // 입력값의 앞뒤 공백 제거
    if (!trimmedMessage || !isConnected) return false; // 메시지가 비어있거나, 소켓이 연결되지 않았으면 전송하지 않음

    const timestamp = new Date().toISOString();
    const serverMessageId = generateRandomIdValue();
    const clientMessageId = createClientMessageId();
    // 사용자 메시지를 객체로 만듭니다.
    const userMessage = {
      id: clientMessageId,
      serverMessageId,
      text: trimmedMessage,
      sender: 'user',
      timestamp,
    };
    // 사용자 메시지를 즉시 UI에 추가 (낙관적 업데이트)
    setMessages(prevMessages => [...prevMessages, userMessage]);
    promptQueueRef.current.push(userMessage);

    // WebSocket 연결이 'OPEN' 상태일 때만 서버로 메시지를 전송합니다.
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = {
        message_id: serverMessageId,
        message: trimmedMessage,
        sender: 'user',
        timestamp,
      };
      ws.current.send(JSON.stringify(payload));
      addTypingIndicator(); // 서버 응답 대기 로딩 표시
      return true;
    } else {
      console.error('WebSocket is not connected.');
      removeTypingIndicator();
      return false;
    }
  }, [addTypingIndicator, isConnected, removeTypingIndicator]);

  const handlePersonaLogin = useCallback(async (persona) => {
    if (!persona?.id) {
      console.warn('Persona ID is required for login.');
      return;
    }
    if (!apiBase) {
      console.warn('API base URL is missing; cannot perform login.');
      return;
    }
    const sessionId = resolveSessionId();
    if (!sessionId) {
      alert('세션 정보를 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.');
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/login/`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          persona_id: persona.id,
        }),
      });
      if (!response.ok) {
        throw new Error('Persona login failed');
      }
      setHasCompletedPersonaLogin(true);
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (!msg.payload?.login_required) {
            return msg;
          }
          return {
            ...msg,
            payload: { ...msg.payload, login_required: false },
          };
        })
      );
      // TODO: 로그인 완료 후 필요한 추가 동작을 여기에서 구현하세요.
    } catch (err) {
      console.error('Persona login request failed', err);
      console.warn('로그인 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [apiBase, resolveSessionId]);

  const handleQuickQuestion = useCallback((questionText) => {
    if (!questionText) return false;
    return handleSendMessage(questionText);
  }, [handleSendMessage]);

  // --- 렌더링 로직 ---

  // 재연결 또는 초기 연결 중일 때를 구분하기 위한 로딩 상태 변수
  const isLoading = !isConnected && isReconnecting;
  const isStreaming = messages.some(msg => msg.isTyping);

  const handleFeedback = useCallback(async (messageId, isHelpful) => {
    if (!messageId || feedbackLoading[messageId]) {
      return;
    }

    const targetValue = isHelpful ? 'up' : 'down';
    if (feedbackStatus[messageId] === targetValue) {
      return;
    }

    if (!apiBase) {
      console.warn('VITE_API_URL is not defined; feedback cannot be sent.');
      return;
    }

    const previousValue = feedbackStatus[messageId];
    setFeedbackStatus(prev => ({ ...prev, [messageId]: targetValue }));
    setFeedbackLoading(prev => ({ ...prev, [messageId]: true }));

    const targetMessage = messages.find(msg => msg.id === messageId);
    const payload = {
      message_id: targetMessage?.serverMessageId ?? messageId,
      is_helpful: isHelpful,
    };
    if (targetMessage?.promptMessageId) {
      payload.prompt_message_id = targetMessage.promptMessageId;
    }
    try {
      const response = await fetch(`${apiBase}/api/chat/feedback`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }
    } catch (err) {
      console.error('Failed to send feedback', err);
      console.log(payload);
      alert('피드백 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setFeedbackStatus(prev => {
        if (previousValue) {
          return { ...prev, [messageId]: previousValue };
        }
        const { [messageId]: _removed, ...rest } = prev;
        return rest;
      });
    } finally {
      setFeedbackLoading(prev => {
        const { [messageId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  }, [apiBase, feedbackLoading, feedbackStatus, messages]);
  
  return (
    <div className={styles.chatWindow}>
      {/* ChatHeader에 핸들러 함수들을 props로 전달 */}
      <div className={styles.headerContainer}>
        <ChatHeader onBack={handleBack} onReconnect={handleReconnect} />
      </div>
      {/* 메시지 목록 (자동 스크롤을 위해 ref 할당) */}
      <div className={styles.messageList} ref={messageListRef}>
        {/* 재연결 중일 때 로딩 메시지 */}
        {isReconnecting && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            새로운 세션에 연결 중입니다...
          </div>
        )}
        {/* 초기 연결 중일 때 로딩 메시지 */}
        {!isReconnecting && !isConnected && messages.length === 0 && !connectionError && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            채팅 서버에 연결 중...
          </div>
        )}
        {connectionError && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#c44' }}>
            {connectionError}
            <div style={{ marginTop: '12px' }}>
              <button
                style={{
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: '#005dcc',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                onClick={handleReconnect}
              >
                다시 연결
              </button>
            </div>
          </div>
        )}
        
        {/* 메시지 목록을 순회하며 ChatMessage 컴포넌트 렌더링 */}
        {messages.map((msg) => {
          const showFeedback =
            msg.sender === 'bot' &&
            !msg.isTyping &&
            msg.id &&
            msg.id !== TYPING_INDICATOR_ID &&
            !msg.disableFeedback;
          const messageId = msg.id;
          return (
            <ChatMessage 
              key={msg.id} 
              text={msg.text} 
              sender={msg.sender}
              isTyping={msg.isTyping}
              timestamp={msg.timestamp}
              showFeedback={showFeedback}
              feedbackValue={showFeedback ? feedbackStatus[messageId] : undefined}
              feedbackDisabled={!!feedbackLoading[messageId]}
              onFeedback={(isHelpful) => handleFeedback(messageId, isHelpful)}
              payload={msg.payload}
              personaOptions={personaOptions}
              onPersonaSelect={handlePersonaLogin}
              hideLoginUI={hasCompletedPersonaLogin}
              onQuickQuestion={handleQuickQuestion}
            />
          );
        })}
      </div>
      
      <ChatFooter
        isInputDisabled={!isConnected || isLoading}
        isStreaming={isStreaming}
        inputRef={inputRef}
        onSend={handleSendMessage}
      />
    </div>
  );
}

export default ChatPage;
