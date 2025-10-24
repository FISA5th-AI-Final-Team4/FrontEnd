import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from '../components/PersonaCard';
import './PersonaSelectPage.css'; // CSS 파일 임포트

function PersonaSelectPage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // 기존 목업 데이터의 이미지 URL을 재사용
  const placeholderImages = [
    'https://pc.wooricard.com/webcontent/cdPrdImgFileList/2025/5/20/fc7a7a20-eab1-49fb-9d5a-ec3c1f5698f4.gif',
    'https://pc.wooricard.com/webcontent/cdPrdImgFileList/2025/6/2/0a3a72fb-3d70-4b4e-898c-176667501c54.gif'
  ];

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/personas`, {
          headers: {
            'accept': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // API 응답 데이터에 이미지 플레이스홀더 추가
        const personasWithImages = data.personas.map((persona, index) => ({
          ...persona,
          image: placeholderImages[index % placeholderImages.length], // 이미지가 순환되도록
        }));

        setPersonas(personasWithImages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const handlePersonaSelect = async (personaId) => {
    setIsCreatingSession(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/session`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persona_id: personaId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      localStorage.setItem('sessionId', data.session_id); // 응답에 따라 session_id로 수정
      localStorage.setItem('selectedPersonaId', personaId);
      
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreatingSession(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="persona-select-container" 
        style={{ justifyContent: 'center' }}
      >
        <h1>로딩 중...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="persona-select-container" 
        style={{ justifyContent: 'center' }}
      >
        <h1>오류: {error}</h1>
      </div>
    );
  }

  return (
    <div className="persona-select-container">
      {isCreatingSession ? (
        <h1 style={{justifyContent: 'center'}}>채팅 세션을 생성하는 중...</h1>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default PersonaSelectPage;
