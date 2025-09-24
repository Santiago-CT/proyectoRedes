import React from 'react';
import { LayoutDashboard, Users, Wifi, History } from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, darkMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'lectores', label: 'Lectores', icon: Wifi },
    { id: 'registros', label: 'Registros', icon: History },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Control de Acceso</h1>
      </div>
      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`sidebar-button ${activeSection === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;