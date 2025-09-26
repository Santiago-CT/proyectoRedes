import React from 'react';
import { NavLink } from 'react-router-dom'; // Importa NavLink
import { LayoutDashboard, Users, Wifi, FileText, Moon, Sun } from 'lucide-react';

const Sidebar = ({ darkMode, setDarkMode }) => {
  const sections = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard /> },
    { name: 'Usuarios', path: '/usuarios', icon: <Users /> },
    { name: 'Lectores', path: '/lectores', icon: <Wifi /> },
    { name: 'Registros', path: '/registros', icon: <FileText /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Control de Acceso</h1>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          // Usamos NavLink, que maneja la clase 'active' automáticamente
          <NavLink
            key={section.name}
            to={section.path}
            className="sidebar-link"
            end // 'end' es crucial para que la ruta "/" no esté siempre activa
          >
            {section.icon}
            <span>{section.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode ? <Sun /> : <Moon />}
          <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;