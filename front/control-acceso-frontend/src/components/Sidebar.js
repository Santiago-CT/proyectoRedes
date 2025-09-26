import React from 'react';
import { NavLink } from 'react-router-dom';
// Se importa el ícono de LogOut
import { LayoutDashboard, Users, Wifi, FileText, Moon, Sun, LogOut } from 'lucide-react';

// Se añade la propiedad "onLogout" para recibir la función desde App.js
const Sidebar = ({ darkMode, setDarkMode, onLogout }) => {
  const sections = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard /> },
    { name: 'Usuarios', path: '/usuarios', icon: <Users /> },
    { name: 'Lectores', path: '/lectores', icon: <Wifi /> },
    { name: 'Registros', path: '/registros', icon: <FileText /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Control de Acceso</h1>
      </div>
      <nav>
        {sections.map((section) => (
          <NavLink
            key={section.name}
            to={section.path}
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            end
          >
            {section.icon}
            <span>{section.name}</span>
          </NavLink>
        ))}
      </nav>
      {/* SECCIÓN INFERIOR CON BOTONES DE MODO OSCURO Y CERRAR SESIÓN */}
      <div style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid var(--border-light)' }}>
        <button onClick={() => setDarkMode(!darkMode)} className="sidebar-button">
          {darkMode ? <Sun /> : <Moon />}
          <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
        {/* ---- BOTÓN AÑADIDO ---- */}
        <button onClick={onLogout} className="sidebar-button">
          <LogOut />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;