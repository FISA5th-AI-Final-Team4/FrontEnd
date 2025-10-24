import React from 'react';
import './PersonaCard.css';

function PersonaCard({ persona, onSelect }) {
  return (
    <div 
      className="persona-card" 
      onClick={() => onSelect(persona.id)}
    >
      <div className="persona-info">
        <h2>{persona.name}</h2>
        <p>{persona.description}</p>
      </div>
      <img src={persona.image} alt={persona.name} className="persona-image" />
    </div>
  );
}

export default PersonaCard;
