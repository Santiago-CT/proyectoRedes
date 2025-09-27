import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Usuarios from './components/Usuarios';
import Lectores from './components/Lectores';
import Registros from './components/Registros';
import Login from './components/Login';
import './App.css';
import { obtenerUsuarios, obtenerLectores, obtenerRegistros } from './api';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Borra el token
    setIsAuthenticated(false); // Actualiza el estado a "no autenticado"
  };

  // --- FUNCIÓN PARA CARGAR DATOS (IMPLEMENTACIÓN COMPLETA) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Realiza todas las peticiones en paralelo para mayor eficiencia
      const [usuariosData, lectoresData, registrosData] = await Promise.all([
        obtenerUsuarios(),
        obtenerLectores(),
        obtenerRegistros()
      ]);
      setUsuarios(usuariosData);
      setLectores(lectoresData);
      setRegistros(registrosData);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      // Si el token es inválido (error 401), cerramos la sesión.
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // El array vacío asegura que la función no se recree innecesariamente.

  // --- NUEVO: Hook para verificar la autenticación al cargar la app ---
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []); // Se ejecuta solo una vez al montar el componente.

  useEffect(() => {
    // Cuando el estado de autenticación cambia a `true`, se cargan los datos.
    if (isAuthenticated) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        {/* Pasamos la función onLogout al Sidebar */}
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