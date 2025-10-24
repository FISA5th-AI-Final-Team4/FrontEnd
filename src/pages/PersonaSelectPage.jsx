import { useNavigate } from 'react-router-dom';
import PersonaCard from '../components/PersonaCard';
import './PersonaSelectPage.css'; // CSS 파일 임포트

function PersonaSelectPage() {
  const navigate = useNavigate();

  // 목업 페르소나 데이터
  const personas = [
    {
      id: 'persona1',
      name: '친절한 상담원',
      description: '고객의 질문에 항상 친절하고 상세하게 답변해 드립니다. 궁금한 점이 있다면 언제든지 물어보세요!',
      image: 'https://via.placeholder.com/80x100/FF5733/FFFFFF?text=P1' // 증명사진 비율 이미지
    },
    {
      id: 'persona2',
      name: '전문가 멘토',
      description: '특정 분야에 대한 깊이 있는 지식을 바탕으로 전문적인 조언과 해결책을 제시합니다. 심층적인 분석이 필요할 때 찾아주세요.',
      image: 'https://via.placeholder.com/80x100/33FF57/FFFFFF?text=P2'
    },
    {
      id: 'persona3',
      name: '유머러스한 친구',
      description: '재치 있는 입담과 유머로 당신의 하루에 웃음을 선사합니다. 가볍고 즐거운 대화를 원할 때 함께해요!',
      image: 'https://via.placeholder.com/80x100/3357FF/FFFFFF?text=P3'
    },
    {
      id: 'persona4',
      name: '진지한 연구원',
      description: '객관적인 사실과 데이터를 기반으로 정확한 정보를 제공합니다. 논리적이고 분석적인 접근을 선호합니다.',
      image: 'https://via.placeholder.com/80x100/FFFF33/000000?text=P4'
    },
    {
      id: 'persona5',
      name: '감성적인 시인',
      description: '아름다운 언어로 감정을 표현하고, 당신의 마음에 울림을 주는 대화를 나눕니다. 예술과 감성에 대해 이야기하고 싶을 때 불러주세요.',
      image: 'https://via.placeholder.com/80x100/FF33FF/FFFFFF?text=P5'
    },
  ];

  const handlePersonaSelect = (personaId) => {
    // 선택된 페르소나 ID를 localStorage에 저장
    localStorage.setItem('selectedPersonaId', personaId);
    
    // 저장이 완료되면 /chat 페이지로 이동
    navigate('/chat'); 
  };

  return (
    <div className="persona-select-container">
      <h1>페르소나를 선택하세요</h1>
      <div className="persona-list">
        {personas.map((persona) => (
          <PersonaCard 
            key={persona.id} 
            persona={persona} 
            onSelect={handlePersonaSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default PersonaSelectPage;