import React from 'react';
import { useVocab } from '../contexts/VocabContext';
import { Volume2, Star, Trash, Sparkles } from 'lucide-react';

const WordList: React.FC = () => {
  const { words, selectedDate, getWordsByDate, updateWordStatus, deleteWords } = useVocab();
  
  const displayWords = selectedDate ? getWordsByDate(selectedDate) : words;

  if (!selectedDate && words.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-10)', color: 'var(--color-text-muted)' }}>
        <Sparkles size={48} style={{ opacity: 0.2, margin: '0 auto var(--spacing-4)' }} />
        <p>Chưa có từ vựng nào. Hãy thêm từ vựng mới để bắt đầu học nhé!</p>
      </div>
    );
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Đọc tiếng Anh
      utterance.rate = 0.9;     // Đọc chậm lại một chút cho rõ
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.");
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {selectedDate ? `Từ vựng ngày ${selectedDate}` : 'Tất cả từ vựng'} 
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginLeft: 'var(--spacing-2)' }}>
            ({displayWords.length} từ)
          </span>
        </h3>
        
        {displayWords.length > 0 && (
          <button style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--glass-border)', 
            padding: 'var(--spacing-2) var(--spacing-4)', 
            borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Học Flashcard
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
        {displayWords.map(word => (
          <div key={word.id} className="glass" style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <div className="flex-between">
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {word.term}
              </h4>
              <button 
                className="icon-btn" 
                style={{ width: 32, height: 32 }}
                onClick={() => handleSpeak(word.term)}
                title="Nghe phát âm"
              >
                <Volume2 size={16} />
              </button>
            </div>
            
            <p style={{ fontWeight: 500 }}>{word.meaning}</p>
            
            <div className="flex-between" style={{ marginTop: 'auto', paddingTop: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <button 
                  onClick={() => updateWordStatus(word.id, word.status === 'forgotten' ? 'learning' : 'forgotten')}
                  style={{
                    background: word.status === 'forgotten' ? 'var(--color-danger)' : 'transparent',
                    color: word.status === 'forgotten' ? 'white' : 'var(--color-text-muted)',
                    border: '1px solid',
                    borderColor: word.status === 'forgotten' ? 'var(--color-danger)' : 'var(--glass-border)',
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-1)'
                  }}
                >
                  <Star size={12} fill={word.status === 'forgotten' ? 'white' : 'none'} />
                  Chưa nhớ
                </button>
              </div>
              
              <button 
                onClick={() => deleteWords([word.id])}
                className="icon-btn" 
                style={{ width: 32, height: 32, color: 'var(--color-danger)' }}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordList;
