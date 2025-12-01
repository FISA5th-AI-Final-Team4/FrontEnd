import React from 'react';
import styles from './QuestionBubble.module.css';

function QuestionBubble({ questions = [], onSelect }) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>관련 질문을 선택해보세요.</p>
      <div className={styles.buttonGroup}>
        {questions.map((question, index) => (
          <button
            key={`${question}-${index}`}
            type="button"
            className={styles.questionButton}
            onClick={() => onSelect?.(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuestionBubble;
