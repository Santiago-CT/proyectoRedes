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
    <aside className={`fixed top-0 left-0 h-screen w-64 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'} shadow-xl transition-all duration-300 z-40 flex flex-col`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-500">Control de Acceso</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;