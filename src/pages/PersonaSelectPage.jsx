import { useNavigate } from 'react-router-dom';

function PersonaSelectPage() {
  const navigate = useNavigate();

  const handlePersonaSelect = (persona) => {
    // TODO: 선택된 페르소나를 (localStorage나 전역 상태에) 저장
    
    // 저장이 완료되면 /chat 페이지로 이동
    navigate('/chat'); 
  };

  return (
    <div>
      <h1>페르소나를 선택하세요</h1>
      <button onClick={() => handlePersonaSelect('personaA')}>페르소나 A</button>
      <button onClick={() => handlePersonaSelect('personaB')}>페르소나 B</button>
    </div>
  );
}

export default PersonaSelectPage;