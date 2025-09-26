import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Lectores from './components/Lectores';
import Registros from './components/Registros';
import './App.css'; // El CSS se importa aquí
import { obtenerUsuarios, obtenerLectores, obtenerRegistros } from './api';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    // No reseteamos isLoading aquí para evitar parpadeos al recargar
    try {
      const [usuariosData, lectoresData, registrosData] = await Promise.all([
        obtenerUsuarios(),
        obtenerLectores(),
        obtenerRegistros(),
      ]);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setLectores(Array.isArray(lectoresData) ? lectoresData : []);
      setRegistros(Array.isArray(registrosData) ? registrosData : []);
    } catch (error) {
      console.error("Error al cargar datos en App.js:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        {/* Ya no pasamos activeSection ni setActiveSection */}
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={ <Dashboard usuarios={usuarios} lectores={lectores} registros={registros} isLoading={isLoading} /> }/>
            <Route path="/usuarios" element={ <Usuarios initialData={usuarios} reloadData={fetchData} darkMode={darkMode} /> }/>
            <Route path="/lectores" element={ <Lectores initialData={lectores} reloadData={fetchData} darkMode={darkMode} /> }/>
            <Route path="/registros" element={ <Registros initialUsuarios={usuarios} initialLectores={lectores} initialRegistros={registros} reloadData={fetchData} darkMode={darkMode} /> }/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;