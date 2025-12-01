import './App.css'
import ChatPage from './pages/ChatPage.jsx';

function App() {
  return (
    <div className="phone-screen-container">
      {/* 여기에 헤더, 푸터 등 공통 UI를 넣을 수 있습니다. */}
      
      <main>
        <ChatPage />
      </main>
    </div>
  );
}

export default App;
