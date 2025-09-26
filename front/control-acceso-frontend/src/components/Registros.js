import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, User, MapPin, Clock, TrendingUp, TrendingDown, Loader2, FileText, Plus, X, List, Users, ChevronLeft, Calendar } from 'lucide-react';
import { obtenerRegistros, obtenerUsuarios, obtenerLectores, crearRegistro, obtenerRegistrosPorUsuario, obtenerRegistrosPorFecha } from '../api';

const Registros = ({ darkMode }) => {
  const [viewMode, setViewMode] = useState('recent');
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ usuarioId: '', lectorId: '' });
  const [dateFilter, setDateFilter] = useState('');

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Carga TODOS los datos necesarios al inicio
  useEffect(() => {
    const cargarDatosGenerales = async () => {
      setIsLoading(true);
      try {
        const [usuariosData, lectoresData, registrosData] = await Promise.all([
          obtenerUsuarios(),
          obtenerLectores(),
          obtenerRegistros(),
        ]);

        const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
        const lectoresArray = Array.isArray(lectoresData) ? lectoresData : [];
        
        setUsuarios(usuariosArray);
        setLectores(lectoresArray);

        const formattedRegistros = (Array.isArray(registrosData) ? registrosData : [])
          .map(r => ({ ...r, usuario: r.usuario || { nombre: 'Usuario Eliminado' }, lector: r.lector || { ubicacion: 'Lector Eliminado' } }))
          .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        setRegistros(formattedRegistros);

      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatosGenerales();
  }, []);

  // Función para abrir el modal de simulación
  const handleOpenModal = () => {
    if (usuarios.length > 0 && lectores.length > 0) {
      // Asegura que el formulario tenga valores por defecto
      setFormData({
        usuarioId: usuarios[0].id,
        lectorId: lectores[0].id,
      });
      setShowModal(true);
    } else {
      alert("Es necesario tener al menos un usuario y un lector creados para simular un registro.");
    }
  };

  const handleSimulate = async (tipoMovimiento) => {
    if (!formData.usuarioId || !formData.lectorId) {
      alert("Por favor, selecciona un usuario y un lector.");
      return;
    }
    try {
      await crearRegistro({ ...formData, tipoMovimiento });
      setShowModal(false);
      
      // Recarga los registros después de la simulación
      const registrosData = await obtenerRegistros();
      const formattedRegistros = (Array.isArray(registrosData) ? registrosData : [])
        .map(r => ({ ...r, usuario: r.usuario || { nombre: 'Usuario Eliminado' }, lector: r.lector || { ubicacion: 'Lector Eliminado' } }))
        .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
      setRegistros(formattedRegistros);
      
      // Vuelve a la vista de recientes para ver el nuevo registro
      setViewMode('recent');
      setSelectedUser(null);
      setDateFilter('');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert("Error: " + error.response.data.message);
      } else {
        console.error("Error al crear el registro:", error);
      }
    }
  };
  
  // Lógica de filtrado de registros
  const registrosMostrados = useMemo(() => {
    let data = registros;

    if (viewMode === 'byUser' && selectedUser) {
        return data.filter(r => r.usuario?.id === selectedUser.id);
    }
    
    if (viewMode === 'recent' && !selectedUser) {
        if (dateFilter) {
            return data.filter(r => new Date(r.fechaHora).toISOString().slice(0, 10) === dateFilter);
        }
        return data.slice(0, 10); // Muestra solo los últimos 10 si no hay filtro
    }

    return []; // No muestra nada si está en 'por usuario' pero no se ha seleccionado uno
  }, [registros, viewMode, selectedUser, dateFilter]);


  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Historial de Registros</h2>
        <p>Consulta el historial de entradas y salidas del sistema.</p>
      </div>

      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: darkMode ? '#374151' : '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button onClick={() => { setViewMode('recent'); setSelectedUser(null); setDateFilter(''); }} className={`btn-toggle ${viewMode === 'recent' ? 'active' : ''}`}>
            <List size={16} /><span>Recientes</span>
          </button>
          <button onClick={() => setViewMode('byUser')} className={`btn-toggle ${viewMode === 'byUser' ? 'active' : ''}`}>
            <Users size={16} /><span>Por Usuario</span>
          </button>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <Plus size={16} /><span>Simular Registro</span>
        </button>
      </div>
      
      {viewMode === 'recent' && !selectedUser && (
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

      {!isLoading && viewMode === 'recent' && (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Usuario</th><th>Lector</th><th>Movimiento</th><th>Fecha y Hora</th></tr></thead>
              <tbody>
                {registrosMostrados.map((r) => (
                  <tr key={r.id}>
                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><User size={16}/>{r.usuario.nombre}</div></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MapPin size={16}/>{r.lector.ubicacion}</div></td>
                    <td><span className={`status-pill ${r.tipoMovimiento === 'entrada'?'entrada':'salida'}`}>{r.tipoMovimiento==='entrada'?<TrendingUp size={14}/>:<TrendingDown size={14}/>}{r.tipoMovimiento}</span></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Clock size={16}/>{new Date(r.fechaHora).toLocaleString()}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {registrosMostrados.length === 0 && <div className="empty-state"><FileText size={48} /><p>No hay registros que coincidan con los filtros</p></div>}
          </div>
      )}

      {!isLoading && viewMode === 'byUser' && !selectedUser && (
          <div className="user-list-container">
            {usuarios.map(user => (
                <div key={user.id} className="user-list-item" onClick={() => setSelectedUser(user)}>
                    <Users size={24} />
                    <div><p className="font-semibold">{user.nombre}</p><p className="text-sm text-secondary">{user.documento}</p></div>
                </div>
            ))}
            {usuarios.length === 0 && <div className="empty-state"><Users size={48} /><p>No se encontraron usuarios</p></div>}
        </div>
      )}

      {!isLoading && selectedUser && (
          <div>
              <div className="toolbar">
                  <button onClick={() => setSelectedUser(null)} className="btn"><ChevronLeft size={16} /><span>Volver</span></button>
                  <h3 className="font-semibold" style={{fontSize:'1.25rem'}}>Historial de {selectedUser.nombre}</h3>
              </div>
               <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Lector</th><th>Movimiento</th><th>Fecha y Hora</th></tr></thead>
                        <tbody>
                            {registrosMostrados.map((r) => (
                                <tr key={r.id}>
                                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><MapPin size={16}/>{r.lector.ubicacion}</div></td>
                                    <td><span className={`status-pill ${r.tipoMovimiento === 'entrada'?'entrada':'salida'}`}>{r.tipoMovimiento==='entrada'?<TrendingUp size={14}/>:<TrendingDown size={14}/>}{r.tipoMovimiento}</span></td>
                                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Clock size={16}/>{new Date(r.fechaHora).toLocaleString()}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {registrosMostrados.length === 0 && <div className="empty-state"><FileText size={48} /><p>No hay registros para este usuario</p></div>}
               </div>
          </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Simular Registro de Acceso</h3><button onClick={() => setShowModal(false)} className="btn-icon"><X size={24} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="usuario">Seleccionar Usuario</label>
                <select id="usuario" value={formData.usuarioId} onChange={(e) => setFormData({...formData, usuarioId: e.target.value})} className="form-select">
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lector">Seleccionar Lector</label>
                <select id="lector" value={formData.lectorId} onChange={(e) => setFormData({...formData, lectorId: e.target.value})} className="form-select">
                   {lectores.map(l => <option key={l.id} value={l.id}>{l.ubicacion}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button onClick={() => handleSimulate('salida')} className="btn btn-danger"><TrendingDown size={16} /><span>Registrar Salida</span></button>
              <button onClick={() => handleSimulate('entrada')} className="btn btn-success"><TrendingUp size={16} /><span>Registrar Entrada</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registros;