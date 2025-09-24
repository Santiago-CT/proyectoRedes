import React, { useState } from 'react';
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
    <div className={`${darkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 min-h-screen`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        darkMode={darkMode}
      />
      <main className="ml-64 p-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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