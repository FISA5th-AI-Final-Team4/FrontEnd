import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PersonaSelectPage from './pages/PersonaSelectPage.jsx' // 1. 페이지 임포트
import ChatPage from './pages/ChatPage.jsx' // 2. 페이지 임포트

// 3. 라우터(경로) 정의
const router = createBrowserRouter([
  {
    path: "/", // 기본 경로
    element: <App />, // App 컴포넌트를 공통 레이아웃으로 사용
    children: [
      {
        index: true, // path: '/'와 동일한 경로일 때
        element: <PersonaSelectPage /> // 페르소나 선택 페이지
      },
      {
        path: "chat", // http://.../chat 경로일 때
        element: <ChatPage /> // 채팅 페이지
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} /> {/* 4. App 대신 RouterProvider를 렌더링 */}
  </StrictMode>,
)