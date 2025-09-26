import React from 'react';
import { Wifi, Users, FileText, Loader2 } from 'lucide-react';

const Dashboard = ({ usuarios, lectores, registros, isLoading }) => {
  if (isLoading) {
    return <div className="loading-indicator"><Loader2 className="spinner" /><span>Cargando dashboard...</span></div>;
  }

  const activeUsers = usuarios.filter(u => u.estado === 'Activo').length;
  const activeLectores = lectores.filter(l => l.estado === 'Activo').length;
  const lastRecord = registros.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))[0];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Resumen general del estado del sistema de control de acceso.</p>
      </div>
      <div className="metric-grid">
        <div className="metric-card border-green">
          <div>
            <p className="title">Usuarios Activos</p>
            <p className="value">{activeUsers} / {usuarios.length}</p>
          </div>
          <Users size={32} className="icon" />
        </div>
        <div className="metric-card border-blue">
          <div>
            <p className="title">Lectores Activos</p>
            <p className="value">{activeLectores} / {lectores.length}</p>
          </div>
          <Wifi size={32} className="icon" />
        </div>
        <div className="metric-card border-purple">
          <div>
            <p className="title">Total Registros</p>
            <p className="value">{registros.length}</p>
          </div>
          <FileText size={32} className="icon" />
        </div>
      </div>
      {lastRecord && (
        <div className="info-box">
          <p><strong>Último registro:</strong> {lastRecord.usuario.nombre} - {lastRecord.tipoMovimiento} en {lastRecord.lector.ubicacion} ({new Date(lastRecord.fechaHora).toLocaleString()})</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;