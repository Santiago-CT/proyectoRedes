import React, { useState, useEffect, useMemo } from 'react';
import { User, ChevronLeft, Loader2, FileText, Clock, MapPin, TrendingUp, TrendingDown, Users, List, Plus, X, Calendar } from 'lucide-react';
import { crearRegistro, obtenerRegistrosPorUsuario, obtenerRegistrosPorFecha } from '../api';

const Registros = ({ initialUsuarios, initialLectores, initialRegistros, reloadData, darkMode }) => {
  const [viewMode, setViewMode] = useState('recent');
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [lectores, setLectores] = useState(initialLectores);
  const [registros, setRegistros] = useState(initialRegistros);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ usuarioId: '', lectorId: '' });
  const [dateFilter, setDateFilter] = useState('');
  
  useEffect(() => {
    setUsuarios(initialUsuarios);
    setLectores(initialLectores);
    setRegistros(initialRegistros);
  }, [initialUsuarios, initialLectores, initialRegistros]);

  const activeUsuarios = useMemo(() => usuarios.filter(u => u.estado === 'Activo'), [usuarios]);
  const activeLectors = useMemo(() => lectores.filter(l => l.estado === 'Activo'), [lectores]);

  const getTodayString = () => new Date().toISOString().slice(0, 10);

  const handleOpenModal = () => {
    if (activeUsuarios.length > 0 && activeLectors.length > 0) {
      setFormData({ usuarioId: activeUsuarios[0].id, lectorId: activeLectors[0].id });
      setShowModal(true);
    } else {
      alert("Se necesita al menos un usuario y un lector activos para simular un registro.");
    }
  };

  const handleSimulate = async (tipoMovimiento) => {
    if (!formData.usuarioId || !formData.lectorId) {
      alert("Por favor, selecciona un usuario y un lector.");
      return;
    }
    setIsLoading(true);
    try {
      await crearRegistro({ ...formData, tipoMovimiento });
      await reloadData();
      setShowModal(false);
      setViewMode('recent');
      setSelectedUser(null);
      setDateFilter('');
    } catch (error) {
      if (error.response?.data?.message) {
        alert("Error: " + error.response.data.message);
      } else {
        console.error("Error al crear el registro:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registrosMostrados = useMemo(() => {
    let data = registros;
    if (viewMode === 'byUser' && selectedUser) return data.filter(r => r.usuario?.id === selectedUser.id);
    if (viewMode === 'recent') {
      if (dateFilter) return data.filter(r => new Date(r.fechaHora).toISOString().slice(0, 10) === dateFilter);
      return data.slice(0, 10);
    }
    return [];
  }, [registros, viewMode, selectedUser, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="page-header"><h2>Historial de Registros</h2><p>Consulta el historial de entradas y salidas del sistema.</p></div>
      <div className="toolbar">
        <div className="toggle-group">
          <button onClick={() => { setViewMode('recent'); setSelectedUser(null); }} className={`btn-toggle ${viewMode === 'recent' ? 'active' : ''}`}><List size={16} /><span>Recientes</span></button>
          <button onClick={() => { setViewMode('byUser'); setSelectedUser(null); }} className={`btn-toggle ${viewMode === 'byUser' ? 'active' : ''}`}><Users size={16} /><span>Por Usuario</span></button>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary"><Plus size={16} /><span>Simular Registro</span></button>
      </div>
      
      {viewMode === 'recent' && (
        <div className="filters-container">
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="date-filter"><Calendar size={16} /> Filtrar por día:</label>
            <input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-input" style={{ maxWidth: '200px' }} />
            <button onClick={() => setDateFilter(getTodayString())} className="btn">Hoy</button>
            <button onClick={() => setDateFilter('')} className="btn">Limpiar</button>
          </div>
        </div>
      )}
      
      {isLoading && <div className="loading-indicator"><Loader2 className="spinner" /></div>}

      {!isLoading && (viewMode === 'recent' || (viewMode === 'byUser' && selectedUser)) && (
        <div className="table-container">
          {selectedUser && (
            <div className="toolbar"><button onClick={() => setSelectedUser(null)} className="btn"><ChevronLeft size={16} /><span>Volver a Usuarios</span></button><h3 className="font-semibold">Historial de {selectedUser.nombre}</h3></div>
          )}
          <table className="data-table">
            <thead><tr><th>Usuario</th><th>Lector</th><th>Movimiento</th><th>Fecha y Hora</th></tr></thead>
            <tbody>
              {registrosMostrados.map((r) => (
                <tr key={r.id}><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><User size={16}/>{r.usuario?.nombre || 'N/A'}</div></td><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MapPin size={16}/>{r.lector?.ubicacion || 'N/A'}</div></td><td><span className={`status-pill ${r.tipoMovimiento === 'entrada'?'entrada':'salida'}`}>{r.tipoMovimiento==='entrada'?<TrendingUp size={14}/>:<TrendingDown size={14}/>}{r.tipoMovimiento}</span></td><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Clock size={16}/>{new Date(r.fechaHora).toLocaleString()}</div></td></tr>
              ))}
            </tbody>
          </table>
          {registrosMostrados.length === 0 && <div className="empty-state"><FileText size={48} /><p>No se encontraron registros</p></div>}
        </div>
      )}

      {!isLoading && viewMode === 'byUser' && !selectedUser && (
        <div className="user-list-container">
          {usuarios.map(user => (<div key={user.id} className="user-list-item" onClick={() => setSelectedUser(user)}><Users size={24} /><div><p className="font-semibold">{user.nombre}</p><p className="text-sm text-secondary">{user.documento}</p></div></div>))}
          {usuarios.length === 0 && <div className="empty-state"><Users size={48} /><p>No se encontraron usuarios</p></div>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Simular Registro</h3><button onClick={() => setShowModal(false)} className="btn-icon"><X size={24} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label htmlFor="usuario">Usuario (Activos)</label><select id="usuario" value={formData.usuarioId} onChange={(e) => setFormData({...formData, usuarioId: e.target.value})} className="form-select">{activeUsuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
              <div className="form-group"><label htmlFor="lector">Lector (Activos)</label><select id="lector" value={formData.lectorId} onChange={(e) => setFormData({...formData, lectorId: e.target.value})} className="form-select">{activeLectors.map(l => <option key={l.id} value={l.id}>{l.ubicacion}</option>)}</select></div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button onClick={() => handleSimulate('salida')} className="btn btn-danger"><TrendingDown size={16} /><span>Salida</span></button>
              <button onClick={() => handleSimulate('entrada')} className="btn btn-success"><TrendingUp size={16} /><span>Entrada</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registros;