import React, { useState } from 'react';
import { BarChart3, Users, Wifi, FileText, Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Lectores from './components/Lectores';
import Registros from './components/Registros';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-40 transition-colors duration-200`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Control de Acceso</h1>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveSection('usuarios')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'usuarios' 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Usuarios</span>
            </button>
            
            <button
              onClick={() => setActiveSection('lectores')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'lectores' 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Wifi className="w-5 h-5" />
              <span>Lectores</span>
            </button>
            
            <button
              onClick={() => setActiveSection('registros')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'registros' 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Registros</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeSection === 'dashboard' && <Dashboard darkMode={darkMode} />}
        {activeSection === 'usuarios' && <Usuarios darkMode={darkMode} />}
        {activeSection === 'lectores' && <Lectores darkMode={darkMode} />}
        {activeSection === 'registros' && <Registros darkMode={darkMode} />}
      </div>
    </div>
  );
}

export default App;