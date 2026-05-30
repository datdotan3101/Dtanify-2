import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Settings, ChevronDown, ChevronRight, Folder, Calendar, Trash2 } from 'lucide-react';
import { useVocab } from '../contexts/VocabContext';
import '../App.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { folders, selectedDate, setSelectedDate } = useVocab();
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  return (
    <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <BookOpen className="sidebar-logo-icon" size={28} />
          <span>Dtanify</span>
        </Link>
      </div>
      
      <div className="sidebar-content">
        <div style={{ marginBottom: 'var(--spacing-4)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quản lý học tập
        </div>
        
        <div className="folder-tree">
          {Object.entries(folders).length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: 'var(--spacing-2)' }}>
              Chưa có dữ liệu
            </div>
          )}
          
          {Object.entries(folders).map(([month, days]) => (
            <div key={month} className="folder-item">
              <div 
                className="folder-header flex-between" 
                onClick={() => toggleMonth(month)}
                style={{ cursor: 'pointer', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}
              >
                <div className="flex-center" style={{ gap: 'var(--spacing-2)' }}>
                  {expandedMonths[month] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <Folder size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 500 }}>Tháng {month}</span>
                </div>
              </div>
              
              {expandedMonths[month] && (
                <div className="folder-children" style={{ paddingLeft: 'var(--spacing-6)', marginTop: 'var(--spacing-1)' }}>
                  {days.map(day => (
                    <div 
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      style={{ 
                        padding: 'var(--spacing-2)', 
                        borderRadius: 'var(--radius-md)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        background: selectedDate === day ? 'var(--color-primary-light)' : 'transparent',
                        color: selectedDate === day ? 'var(--color-primary-hover)' : 'inherit',
                        fontWeight: selectedDate === day ? 600 : 400
                      }}
                    >
                      <Calendar size={16} />
                      Ngày {day}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button className="icon-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-2)' }}>
          <Trash2 size={20} style={{ marginRight: 'var(--spacing-3)' }} />
          <span>Thùng rác</span>
        </button>
        <button className="icon-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
          <Settings size={20} style={{ marginRight: 'var(--spacing-3)' }} />
          <span>Cài đặt</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
