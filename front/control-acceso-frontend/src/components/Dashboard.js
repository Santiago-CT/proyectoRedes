import React from 'react';
import { Users, Wifi, Activity, Clock, User } from 'lucide-react';

const mockRegistros = [
  { id: 1, usuario: 'Juan Pérez', lector: 'Entrada Principal', tipoMovimiento: 'Entrada', fechaHora: '2024-01-15 08:30:00' },
  { id: 2, usuario: 'María García', lector: 'Sala de Servidores', tipoMovimiento: 'Entrada', fechaHora: '2024-01-15 09:15:00' },
  { id: 3, usuario: 'Carlos López', lector: 'Oficina Administrativa', tipoMovimiento: 'Salida', fechaHora: '2024-01-15 12:30:00' },
  { id: 4, usuario: 'Ana Martínez', lector: 'Almacén', tipoMovimiento: 'Entrada', fechaHora: '2024-01-15 14:20:00' },
  { id: 5, usuario: 'Juan Pérez', lector: 'Entrada Principal', tipoMovimiento: 'Salida', fechaHora: '2024-01-15 18:00:00' }
];

const MetricCard = ({ title, value, icon: Icon, color, subtitle, darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
      </div>
      <Icon className={`w-8 h-8 ${color.includes('blue') ? 'text-blue-500' : color.includes('green') ? 'text-green-500' : color.includes('yellow') ? 'text-yellow-500' : 'text-purple-500'}`} />
    </div>
  </div>
);

const Dashboard = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard Principal</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Vista general del sistema de control de acceso
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Usuarios" 
          value="24" 
          icon={Users} 
          color="border-blue-500"
          subtitle="Usuarios registrados"
          darkMode={darkMode}
        />
        <MetricCard 
          title="Total Lectores" 
          value="8" 
          icon={Wifi} 
          color="border-green-500"
          subtitle="Lectores activos"
          darkMode={darkMode}
        />
        <MetricCard 
          title="Registros Hoy" 
          value="45" 
          icon={Activity} 
          color="border-yellow-500"
          subtitle="Entradas y salidas"
          darkMode={darkMode}
        />
        <MetricCard 
          title="Última Entrada" 
          value="18:00" 
          icon={Clock} 
          color="border-purple-500"
          subtitle="Juan Pérez"
          darkMode={darkMode}
        />
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h3 className="text-lg font-semibold mb-4">Últimos Movimientos</h3>
        <div className="space-y-3">
          {mockRegistros.slice(0, 5).map((registro) => (
            <div key={registro.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${registro.tipoMovimiento === 'Entrada' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">{registro.usuario}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{registro.lector}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${registro.tipoMovimiento === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {registro.tipoMovimiento}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(registro.fechaHora).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;