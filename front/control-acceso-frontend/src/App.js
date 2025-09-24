import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Lectores from './components/Lectores';
import Registros from './components/Registros';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard darkMode={darkMode} />;
      case 'usuarios':
        return <Usuarios darkMode={darkMode} />;
      case 'lectores':
        return <Lectores darkMode={darkMode} />;
      case 'registros':
        return <Registros darkMode={darkMode} />;
      default:
        return <Dashboard darkMode={darkMode} />;
    }
  };

  return (
    <div className={darkMode ? 'dark app-container' : 'app-container'}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        darkMode={darkMode}
      />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode ? '#374151' : '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: darkMode ? '#f9fafb' : '#1f2937'
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;