import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

// Types
export type WordStatus = 'new' | 'learning' | 'remembered' | 'forgotten';

export interface Word {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  examples?: string[];
  status: WordStatus;
  dateAdded: string; // YYYY-MM-DD
  monthFolder: string; // YYYY-MM
  createdAt?: number;
}

export interface VocabContextType {
  words: Word[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  addWords: (newWords: Omit<Word, 'id' | 'status'>[]) => void;
  updateWordStatus: (id: string, status: WordStatus) => void;
  deleteWords: (ids: string[]) => void;
  getWordsByDate: (date: string) => Word[];
  getForgottenWords: () => Word[];
  folders: { [month: string]: string[] }; // month -> days[]
  loading: boolean;
}

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Lắng nghe dữ liệu từ Firestore
  useEffect(() => {
    // Truy vấn collection 'vocabulary', sắp xếp theo thời gian tạo
    const q = query(collection(db, 'vocabulary'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWords: Word[] = [];
      snapshot.forEach((doc) => {
        fetchedWords.push({ id: doc.id, ...doc.data() } as Word);
      });
      setWords(fetchedWords);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi tải dữ liệu từ Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Derive folders from words
  const folders = React.useMemo(() => {
    const f: { [month: string]: string[] } = {};
    words.forEach(w => {
      if (!f[w.monthFolder]) {
        f[w.monthFolder] = [];
      }
      if (!f[w.monthFolder].includes(w.dateAdded)) {
        f[w.monthFolder].push(w.dateAdded);
      }
    });
    // Sort
    Object.keys(f).forEach(month => {
      f[month].sort((a, b) => b.localeCompare(a));
    });
    return f;
  }, [words]);

  const addWords = async (newWords: Omit<Word, 'id' | 'status'>[]) => {
    try {
      const wordsToProcessAI: {id: string, term: string}[] = [];
      
      const promises = newWords.map(nw => {
        const id = crypto.randomUUID();
        const wordData: Word = {
          ...nw,
          id,
          status: 'new',
          createdAt: Date.now()
        };
        
        if (wordData.meaning === 'Đang chờ AI cập nhật...') {
          wordsToProcessAI.push({ id, term: wordData.term });
        }
        
        // Lưu lên Firestore ngay lập tức để UI không bị đơ
        return setDoc(doc(db, 'vocabulary', id), wordData);
      });
      
      await Promise.all(promises);

      // Kích hoạt AI chạy ngầm cho các từ chưa có nghĩa
      if (wordsToProcessAI.length > 0) {
        processAIBackground(wordsToProcessAI);
      }
      
    } catch (error) {
      console.error("Lỗi khi thêm từ vựng:", error);
      alert("Đã xảy ra lỗi khi lưu từ vựng!");
    }
  };

  const processAIBackground = async (wordsToProcess: {id: string, term: string}[]) => {
    // Import AI service động để tránh circular dependency nếu có
    const { generateFlashcardData } = await import('../services/ai');
    
    for (const item of wordsToProcess) {
      try {
        const data = await generateFlashcardData(item.term);
        if (data) {
          const wordRef = doc(db, 'vocabulary', item.id);
          await updateDoc(wordRef, {
            meaning: data.meaning,
            pronunciation: data.pronunciation || '',
            examples: data.examples || []
          });
        } else {
          // Fallback nếu AI lỗi
          await updateDoc(doc(db, 'vocabulary', item.id), {
            meaning: 'Không tìm thấy nghĩa'
          });
        }
      } catch (err) {
        console.error(`Lỗi AI cho từ ${item.term}:`, err);
      }
    }
  };

  const updateWordStatus = async (id: string, status: WordStatus) => {
    try {
      const wordRef = doc(db, 'vocabulary', id);
      await updateDoc(wordRef, { status });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const deleteWords = async (ids: string[]) => {
    try {
      const promises = ids.map(id => deleteDoc(doc(db, 'vocabulary', id)));
      await Promise.all(promises);
    } catch (error) {
      console.error("Lỗi khi xoá từ vựng:", error);
    }
  };

  const getWordsByDate = (date: string) => {
    return words.filter(w => w.dateAdded === date);
  };

  const getForgottenWords = () => {
    return words.filter(w => w.status === 'forgotten');
  };

  return (
    <VocabContext.Provider value={{
      words,
      selectedDate,
      setSelectedDate,
      addWords,
      updateWordStatus,
      deleteWords,
      getWordsByDate,
      getForgottenWords,
      folders,
      loading
    }}>
      {children}
    </VocabContext.Provider>
  );
};

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (context === undefined) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};
