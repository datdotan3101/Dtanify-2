import React from 'react';
import VocabInput from '../components/VocabInput';
import WordList from '../components/WordList';
import { useVocab } from '../contexts/VocabContext';
import { BookOpen } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { getForgottenWords } = useVocab();
  const forgottenWords = getForgottenWords();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Section: Reading Passage & Forgotten Words */}
      <div className="dashboard-top-section">
        
        {/* Reading Passage */}
        <div className="glass" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <BookOpen color="var(--color-primary)" />
            Bài đọc hôm nay
          </h2>
          <div style={{ 
            background: 'var(--color-surface)', 
            padding: 'var(--spacing-4)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            lineHeight: 1.6
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              (AI sẽ tự động tạo bài đọc tiếng Anh ngắn dựa trên các từ vựng bạn đang học, ưu tiên các từ chưa nhớ...)
            </p>
          </div>
        </div>

        {/* Forgotten Words */}
        <div className="glass" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-4)', color: 'var(--color-danger)' }}>
            Từ chưa nhớ ({forgottenWords.length})
          </h2>
          {forgottenWords.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Tuyệt vời! Bạn không có từ nào bị quên.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
              {forgottenWords.map(word => (
                <span key={word.id} style={{ 
                  background: 'var(--color-danger)', 
                  color: 'white', 
                  padding: 'var(--spacing-1) var(--spacing-2)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  {word.term}
                </span>
              ))}
            </div>
          )}
        </div>
        
      </div>

      <VocabInput />
      
      <WordList />
      
    </div>
  );
};

export default Dashboard;
