import React, { useState, useEffect } from 'react';
import { Users, Wifi, Activity, Clock, Loader2 } from 'lucide-react';
import { obtenerUsuarios, obtenerLectores, obtenerRegistros } from '../api';

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
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [usuariosData, lectoresData, registrosData] = await Promise.all([
          obtenerUsuarios(),
          obtenerLectores(),
          obtenerRegistros(),
        ]);
        
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
        setLectores(Array.isArray(lectoresData) ? lectoresData : []);

        const formattedRegistros = (Array.isArray(registrosData) ? registrosData : []).map(registro => ({
          ...registro,
          usuario: registro.usuario?.nombre || 'N/A',
          lector: registro.lector?.ubicacion || 'N/A',
          tipoMovimiento: registro.tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida',
        }));
        setRegistros(formattedRegistros);
        
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setUsuarios([]);
        setLectores([]);
        setRegistros([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const registrosHoy = registros.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(r.fechaHora).toISOString().split('T')[0] === today;
  }).length;
  
  const lastEntry = registros.slice().sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).find(r => r.tipoMovimiento === 'Entrada');


  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard Principal</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Vista general del sistema de control de acceso
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <span className="ml-4 text-xl">Cargando datos del dashboard...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total Usuarios" 
              value={usuarios.length} 
              icon={Users} 
              color="border-blue-500"
              subtitle="Usuarios registrados"
              darkMode={darkMode}
            />
            <MetricCard 
              title="Total Lectores" 
              value={lectores.length} 
              icon={Wifi} 
              color="border-green-500"
              subtitle="Lectores activos"
              darkMode={darkMode}
            />
            <MetricCard 
              title="Registros Hoy" 
              value={registrosHoy} 
              icon={Activity} 
              color="border-yellow-500"
              subtitle="Entradas y salidas"
              darkMode={darkMode}
            />
            <MetricCard 
              title="Última Entrada" 
              value={lastEntry ? new Date(lastEntry.fechaHora).toLocaleTimeString() : 'N/A'} 
              icon={Clock} 
              color="border-purple-500"
              subtitle={lastEntry ? lastEntry.usuario : 'Sin entradas recientes'}
              darkMode={darkMode}
            />
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className="text-lg font-semibold mb-4">Últimos Movimientos</h3>
            <div className="space-y-3">
              {registros.slice(0, 5).map((registro) => (
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
               {registros.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay movimientos registrados.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;