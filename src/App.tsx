import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Bell, User, Menu } from 'lucide-react';
import { VocabProvider } from './contexts/VocabContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="flex-center" style={{ gap: 'var(--spacing-4)' }}>
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <div className="quote-text text-gradient">
              "Học để rút ngắn khoảng cách gặp JungKook"
            </div>
          </div>
          
          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>
        </header>
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <VocabProvider>
        <AppContent />
      </VocabProvider>
    </Router>
  );
}

export default App;
