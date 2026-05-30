import React, { useState, useRef } from 'react';
import { useVocab } from '../contexts/VocabContext';
import { PlusCircle, FileSpreadsheet, Upload, Plus, Trash2 } from 'lucide-react';
import readXlsxFile from 'read-excel-file/browser';

interface InputRow {
  id: string;
  word: string;
  meaning: string;
}

const VocabInput: React.FC = () => {
  const { addWords } = useVocab();
  const [rows, setRows] = useState<InputRow[]>([{ id: crypto.randomUUID(), word: '', meaning: '' }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), word: '', meaning: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const handleRowChange = (id: string, field: 'word' | 'meaning', value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const processImportedData = (data: {word: string, meaning: string}[]) => {
    const newRows = data.map(d => ({
      id: crypto.randomUUID(),
      word: d.word,
      meaning: d.meaning
    }));
    
    // If the current list only has one empty row, replace it. Otherwise append.
    if (rows.length === 1 && !rows[0].word && !rows[0].meaning) {
      setRows(newRows);
    } else {
      setRows([...rows, ...newRows]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('\t') || pastedText.includes('\n')) {
      e.preventDefault();
      const lines = pastedText.split('\n');
      const pastedData: {word: string, meaning: string}[] = [];
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('\t');
        pastedData.push({
          word: parts[0]?.trim() || '',
          meaning: parts[1]?.trim() || ''
        });
      }
      
      if (pastedData.length > 0) {
        // Insert pasted data starting from the current row
        const newRows = [...rows];
        
        pastedData.forEach((data, i) => {
          if (index + i < newRows.length) {
            newRows[index + i].word = data.word;
            newRows[index + i].meaning = data.meaning;
          } else {
            newRows.push({
              id: crypto.randomUUID(),
              word: data.word,
              meaning: data.meaning
            });
          }
        });
        
        setRows(newRows);
      }
    }
  };

  const handleSubmit = () => {
    const validRows = rows.filter(r => r.word.trim() !== '');
    if (validRows.length === 0) return;
    
    const newWords = [];
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);
    
    for (const row of validRows) {
      newWords.push({
        term: row.word.trim(),
        meaning: row.meaning.trim() || 'Đang chờ AI cập nhật...',
        dateAdded: dateStr,
        monthFolder: monthStr,
      });
    }
    
    addWords(newWords);
    setRows([{ id: crypto.randomUUID(), word: '', meaning: '' }]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedRows = await readXlsxFile(file);
      const data = parsedRows.map(row => ({
        word: row[0]?.toString() || '',
        meaning: row[1]?.toString() || ''
      })).filter(r => r.word);
      
      processImportedData(data);
    } catch (error) {
      console.error("Lỗi khi đọc file Excel:", error);
      alert("Không thể đọc file Excel. Vui lòng đảm bảo file đúng định dạng.");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <FileSpreadsheet color="var(--color-success)" />
          Nhập từ vựng nhanh
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--glass-border)',
              padding: 'var(--spacing-1) var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} />
            Import Excel
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary-hover)',
        padding: 'var(--spacing-3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        marginBottom: 'var(--spacing-4)',
        border: '1px solid var(--color-primary)',
        opacity: 0.9
      }}>
        <strong>💡 Hướng dẫn nhập liệu:</strong><br/>
        - Bạn có thể gõ trực tiếp hoặc bấm <strong>Ctrl+V</strong> dán từ Excel vào ô bất kỳ.<br/>
        - Nghĩa tiếng Việt có thể để trống để AI tự động dịch.
      </div>
      
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          <div>Từ vựng (Tiếng Anh)</div>
          <div>Nghĩa tiếng Việt</div>
          <div></div>
        </div>
        
        {rows.map((row, index) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
            <input
              type="text"
              value={row.word}
              onChange={(e) => handleRowChange(row.id, 'word', e.target.value)}
              onPaste={(e) => handlePaste(e, index)}
              placeholder="Ví dụ: Apple"
              style={{
                width: '100%',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <input
              type="text"
              value={row.meaning}
              onChange={(e) => handleRowChange(row.id, 'meaning', e.target.value)}
              onPaste={(e) => handlePaste(e, index)}
              placeholder="Ví dụ: Quả táo (tuỳ chọn)"
              style={{
                width: '100%',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <button 
              onClick={() => handleRemoveRow(row.id)}
              disabled={rows.length === 1}
              style={{
                background: 'transparent',
                border: 'none',
                color: rows.length === 1 ? 'var(--color-text-muted)' : 'var(--color-danger)',
                cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: rows.length === 1 ? 0.3 : 1
              }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex-between">
        <button 
          onClick={handleAddRow}
          style={{
            background: 'transparent',
            color: 'var(--color-primary)',
            border: '1px dashed var(--color-primary)',
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Thêm dòng mới
        </button>
        
        <button 
          onClick={handleSubmit}
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            padding: 'var(--spacing-2) var(--spacing-6)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform var(--transition-fast)',
            cursor: 'pointer',
            opacity: rows.some(r => r.word.trim()) ? 1 : 0.5
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          disabled={!rows.some(r => r.word.trim())}
        >
          <PlusCircle size={18} />
          Thêm {rows.filter(r => r.word.trim()).length > 0 ? rows.filter(r => r.word.trim()).length : ''} từ
        </button>
      </div>
    </div>
  );
};

export default VocabInput;
