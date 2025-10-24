import React from 'react';
import style from './PersonaCard.module.css';

function PersonaCard({ persona, onSelect }) {
  return (
    <div 
      className={style.personaCard} 
      onClick={() => onSelect(persona.id)}
    >
      <div className={style.personaInfo}>
        <h2>{persona.name}</h2>
        <p>{persona.description}</p>
      </div>
      <img src={persona.image} alt={persona.name} className={style.personaImage} />
    </div>
  );
}

export default PersonaCard;
