import React, { useState, useEffect, useMemo } from 'react';
import { User, ChevronLeft, Loader2, FileText, Clock, MapPin, TrendingUp, TrendingDown, Users, List, Plus, X, Calendar, Search } from 'lucide-react';
import { 
    obtenerRegistros, 
    obtenerUsuarios, 
    obtenerLectores, 
    crearRegistro, 
    obtenerRegistrosPorUsuario, 
    obtenerUsuariosActivos, 
    obtenerLectoresActivos,
    obtenerLectoresConRegistros // Importamos la nueva función
} from '../api';

const Registros = ({ initialUsuarios, initialLectores, initialRegistros, reloadData, darkMode }) => {
  const [viewMode, setViewMode] = useState('recent');
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [lectores, setLectores] = useState(initialLectores); // Lista completa de lectores
  const [lectoresFiltrados, setLectoresFiltrados] = useState([]); // NUEVO: Lista para el filtro
  const [registros, setRegistros] = useState(initialRegistros);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ usuarioId: '', lectorId: '' });
  const [dateFilter, setDateFilter] = useState('');
  const [lectorFilter, setLectorFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Sincroniza con los datos de App.js y carga los lectores con registros
  useEffect(() => {
    setUsuarios(initialUsuarios);
    setLectores(initialLectores);
    setRegistros(initialRegistros);

    const fetchLectoresConRegistros = async () => {
        try {
            const data = await obtenerLectoresConRegistros();
            setLectoresFiltrados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al obtener lectores con registros:", error);
        }
    };
    fetchLectoresConRegistros();
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
    setIsLoading(true);
    try {
      await crearRegistro({ ...formData, tipoMovimiento });
      await reloadData(); // Recarga toda la data
      setShowModal(false);
      setViewMode('recent');
      setSelectedUser(null);
      setDateFilter('');
      setLectorFilter('all');
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
    if (viewMode === 'byUser' && selectedUser) {
      return data.filter(r => r.usuario?.id === selectedUser.id);
    }
    if (viewMode === 'recent') {
      if (dateFilter) {
        data = data.filter(r => new Date(r.fechaHora).toISOString().slice(0, 10) === dateFilter);
      }
      if (lectorFilter !== 'all') {
        data = data.filter(r => r.lector?.id === Number(lectorFilter));
      }
      return data;
    }
    return [];
  }, [registros, viewMode, selectedUser, dateFilter, lectorFilter]);

  const usuariosFiltrados = useMemo(() => {
    if (!userSearchTerm) return usuarios;
    return usuarios.filter(u => 
      u.nombre.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [usuarios, userSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Historial de Registros</h2>
        <p>Consulta el historial de entradas y salidas del sistema.</p>
      </div>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: darkMode ? '#374151' : '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button onClick={() => { setViewMode('recent'); setSelectedUser(null); }} className={`btn-toggle ${viewMode === 'recent' ? 'active' : ''}`}><List size={16} /><span>Recientes</span></button>
          <button onClick={() => { setViewMode('byUser'); setSelectedUser(null); }} className={`btn-toggle ${viewMode === 'byUser' ? 'active' : ''}`}><Users size={16} /><span>Por Usuario</span></button>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary"><Plus size={16} /><span>Simular Registro</span></button>
      </div>
      
      {viewMode === 'recent' && (
        <div className="filters-container" style={{flexWrap: 'wrap'}}>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="date-filter"><Calendar size={16} /> Día:</label>
            <input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-input" style={{ maxWidth: '180px' }} />
            <button onClick={() => setDateFilter(getTodayString())} className="btn">Hoy</button>
            <button onClick={() => setDateFilter('')} className="btn">Limpiar</button>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="lector-filter"><MapPin size={16} /> Lector:</label>
            {/* CORREGIDO: El select ahora usa la lista 'lectoresFiltrados' */}
            <select id="lector-filter" value={lectorFilter} onChange={(e) => setLectorFilter(e.target.value)} className="form-select" style={{ maxWidth: '200px' }}>
              <option value="all">Todos los Lectores</option>
              {lectoresFiltrados.map(l => <option key={l.id} value={l.id}>{l.ubicacion}</option>)}
            </select>
          </div>
        </div>
      )}

      {viewMode === 'byUser' && !selectedUser && (
        <div className="filters-container">
          <div className="form-group" style={{ flexGrow: 1 }}>
            <label htmlFor="user-search"><Search size={16}/> Buscar Usuario por Nombre:</label>
            <input id="user-search" type="text" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="form-input" placeholder="Escribe un nombre..."/>
          </div>
        </div>
      )}
      
      {isLoading && <div className="loading-indicator"><Loader2 className="spinner" /></div>}

      {/* El resto del JSX no cambia, ya que la lógica de renderizado es la misma */}
      {!isLoading && (viewMode === 'recent' || (viewMode === 'byUser' && selectedUser)) && (
          <div className="table-container">
              {selectedUser && ( <div className="toolbar"><button onClick={() => setSelectedUser(null)} className="btn"><ChevronLeft size={16} /><span>Volver a Usuarios</span></button><h3 className="font-semibold">Historial de {selectedUser.nombre}</h3></div> )}
              <table className="data-table">
                  <thead><tr><th>Usuario</th><th>Lector</th><th>Movimiento</th><th>Fecha y Hora</th></tr></thead>
                  <tbody>
                      {registrosMostrados.map((r) => ( <tr key={r.id}><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><User size={16}/>{r.usuario?.nombre || 'N/A'}</div></td><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MapPin size={16}/>{r.lector?.ubicacion || 'N/A'}</div></td><td><span className={`status-pill ${r.tipoMovimiento === 'entrada'?'entrada':'salida'}`}>{r.tipoMovimiento==='entrada'?<TrendingUp size={14}/>:<TrendingDown size={14}/>}{r.tipoMovimiento}</span></td><td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Clock size={16}/>{new Date(r.fechaHora).toLocaleString()}</div></td></tr> ))}
                  </tbody>
              </table>
              {registrosMostrados.length === 0 && <div className="empty-state"><FileText size={48} /><p>No se encontraron registros</p></div>}
          </div>
      )}
      {!isLoading && viewMode === 'byUser' && !selectedUser && (
          <div className="user-list-container">
              {usuariosFiltrados.map(user => ( <div key={user.id} className="user-list-item" onClick={() => setSelectedUser(user)}><Users size={24} /><div><p className="font-semibold">{user.nombre}</p><p className="text-sm text-secondary">{user.documento}</p></div></div> ))}
              {usuariosFiltrados.length === 0 && <div className="empty-state"><Users size={48} /><p>No se encontraron usuarios con ese nombre</p></div>}
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