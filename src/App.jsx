import { useState } from 'react'
import { Outlet } from 'react-router-dom'; // Outlet 임포트
import './App.css'

function App() {
  return (
    <div className="phone-screen-container">
      {/* 여기에 헤더, 푸터 등 공통 UI를 넣을 수 있습니다. */}
      
      <main>
        {/* 이 Outlet 부분에 라우터 설정에 따라
          <PersonaSelectPage /> 또는 <ChatPage />가 렌더링됩니다.
        */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default App;