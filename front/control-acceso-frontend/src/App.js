import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Lectores from './components/Lectores';
import Registros from './components/Registros';
import Login from './components/Login'; // Importa el nuevo componente
import './App.css';
import { obtenerUsuarios, obtenerLectores, obtenerRegistros } from './api';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // Estados para los datos de la app
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    // ... (la función fetchData se mantiene igual)
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        {isAuthenticated && <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            
            <Route path="/" element={isAuthenticated ? <Dashboard {...{usuarios, lectores, registros, isLoading}} /> : <Navigate to="/login" />} />
            <Route path="/usuarios" element={isAuthenticated ? <Usuarios {...{initialData: usuarios, reloadData: fetchData, darkMode}} /> : <Navigate to="/login" />} />
            <Route path="/lectores" element={isAuthenticated ? <Lectores {...{initialData: lectores, reloadData: fetchData, darkMode}} /> : <Navigate to="/login" />} />
            <Route path="/registros" element={isAuthenticated ? <Registros {...{initialUsuarios: usuarios, initialLectores: lectores, initialRegistros: registros, reloadData: fetchData, darkMode}} /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;