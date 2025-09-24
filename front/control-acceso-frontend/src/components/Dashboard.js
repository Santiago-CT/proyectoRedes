import React, { useState, useEffect } from 'react';
import { Users, Wifi, Activity, Clock, Loader2 } from 'lucide-react';
import { obtenerUsuarios, obtenerLectores, obtenerRegistros } from '../api';

const MetricCard = ({ title, value, icon: Icon, colorClass, subtitle, darkMode }) => (
  <div className={`metric-card ${colorClass}`}>
      <div>
          <p className="title">{title}</p>
          <p className="value">{value}</p>
          {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      <Icon size={32} className="icon" />
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

        const formattedRegistros = (Array.isArray(registrosData) ? registrosData : [])
            .map(registro => ({
                ...registro,
                usuario: registro.usuario?.nombre || 'N/A',
                lector: registro.lector?.ubicacion || 'N/A',
                tipoMovimiento: registro.tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida',
            }))
            .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        setRegistros(formattedRegistros);
        
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const registrosHoy = registros.filter(r => new Date(r.fechaHora).toDateString() === new Date().toDateString()).length;
  
  const lastEntry = registros.find(r => r.tipoMovimiento === 'Entrada');

  if (isLoading) {
    return (
      <div className="loading-indicator">
        <Loader2 className="spinner" />
        <span>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Dashboard Principal</h2>
        <p>Vista general del sistema de control de acceso</p>
      </div>
      
      <div className="metric-grid">
        <MetricCard title="Total Usuarios" value={usuarios.length} icon={Users} colorClass="border-blue" subtitle="Usuarios registrados" darkMode={darkMode}/>
        <MetricCard title="Total Lectores" value={lectores.length} icon={Wifi} colorClass="border-green" subtitle="Lectores activos" darkMode={darkMode}/>
        <MetricCard title="Registros Hoy" value={registrosHoy} icon={Activity} colorClass="border-yellow" subtitle="Entradas y salidas" darkMode={darkMode}/>
        <MetricCard title="Última Entrada" value={lastEntry ? new Date(lastEntry.fechaHora).toLocaleTimeString() : 'N/A'} icon={Clock} colorClass="border-purple" subtitle={lastEntry ? lastEntry.usuario : 'Sin entradas recientes'} darkMode={darkMode}/>
      </div>
      
      <div className="card">
        <h3 style={{fontSize: '1.25rem', fontWeight: 600, margin: 0}}>Últimos Movimientos</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          {registros.slice(0, 5).map((registro) => (
            <div key={registro.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#f9fafb'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: registro.tipoMovimiento === 'Entrada' ? '#10b981' : '#ef4444'}}></div>
                <div>
                  <p style={{fontWeight: 500, margin: 0}}>{registro.usuario}</p>
                  <p className="text-sm" style={{color: darkMode ? '#9ca3af' : '#6b7280', margin: 0}}>{registro.lector}</p>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <p className="text-sm font-medium" style={{color: registro.tipoMovimiento === 'Entrada' ? '#10b981' : '#ef4444', margin: 0}}>
                  {registro.tipoMovimiento}
                </p>
                <p className="text-xs" style={{color: darkMode ? '#9ca3af' : '#6b7280', margin: 0}}>
                  {new Date(registro.fechaHora).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {registros.length === 0 && (
            <div className="empty-state">No hay movimientos registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;