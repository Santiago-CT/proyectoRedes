import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, MapPin, Wifi, Activity, Loader2, Users, List } from 'lucide-react';
import { 
    crearLector, 
    actualizarLector, 
    eliminarLector,
    obtenerLectoresConRegistros 
} from '../api';

const Lectores = ({ initialData, reloadData, darkMode }) => {
  const [lectores, setLectores] = useState(initialData);
  const [lectoresConRegistros, setLectoresConRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLector, setEditingLector] = useState(null);
  const [formData, setFormData] = useState({ ubicacion: '', estado: 'Activo' });
  const [viewFilter, setViewFilter] = useState('all');

  useEffect(() => {
    setLectores(initialData);
    const fetchLectoresConRegistros = async () => {
        try {
            const data = await obtenerLectoresConRegistros();
            setLectoresConRegistros(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al obtener lectores con registros:", error);
        }
    };
    fetchLectoresConRegistros();
  }, [initialData]);
  
  const handleAction = async (action) => {
    setIsLoading(true);
    try {
      await action();
      await reloadData(); 
      const data = await obtenerLectoresConRegistros();
      setLectoresConRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ocurrió un error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (lector = null) => {
    setEditingLector(lector);
    setFormData(lector || { ubicacion: '', estado: 'Activo' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLector(null);
    setFormData({ ubicacion: '', estado: 'Activo' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleAction(async () => {
      if (editingLector) {
        await actualizarLector(editingLector.id, formData);
      } else {
        await crearLector(formData);
      }
      closeModal();
    });
  };

  const deleteLector = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lector?')) {
      handleAction(async () => await eliminarLector(id));
    }
  };

  const lectoresMostrados = viewFilter === 'all' ? lectores : lectoresConRegistros;
  const lectoresActivos = lectores.filter(l => l.estado === 'Activo').length;

  return (
    <div className="space-y-6">
      <div className="page-header"><h2>Gestión de Lectores</h2><p>Configura y gestiona los lectores RFID del sistema</p></div>
      <div className="metric-grid">
        <div className="metric-card border-green"><div><p className="title">Lectores Activos</p><p className="value">{lectoresActivos}</p></div><Wifi size={32} className="icon" /></div>
        <div className="metric-card border-red"><div><p className="title">Lectores Inactivos</p><p className="value">{lectores.length - lectoresActivos}</p></div><Wifi size={32} className="icon" /></div>
        <div className="metric-card border-blue"><div><p className="title">Total Lectores</p><p className="value">{lectores.length}</p></div><Users size={32} className="icon" /></div>
      </div>
      
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: darkMode ? '#374151' : '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button onClick={() => setViewFilter('all')} className={`btn-toggle ${viewFilter === 'all' ? 'active' : ''}`}>
            <List size={16} />
            <span>Todos</span>
          </button>
          <button onClick={() => setViewFilter('withRecords')} className={`btn-toggle ${viewFilter === 'withRecords' ? 'active' : ''}`}>
            <Activity size={16} />
            <span>Con Registros</span>
          </button>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Agregar Lector</span>
        </button>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator"><Loader2 className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {lectoresMostrados.map((lector) => (
                <tr key={lector.id}>
                  <td>#{lector.id}</td>
                  <td>{lector.ubicacion}</td>
                  <td><span className={`status-pill ${lector.estado === 'Activo' ? 'active' : 'inactive'}`}>{lector.estado || 'Indefinido'}</span></td>
                  <td style={{display: 'flex', gap: '0.5rem'}}>
                    <button onClick={() => openModal(lector)} className="btn-icon" title="Editar"><Edit size={16} color="#3b82f6" /></button>
                    <button onClick={() => deleteLector(lector.id)} className="btn-icon" title="Eliminar"><Trash2 size={16} color="#ef4444" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && lectoresMostrados.length === 0 && (<div className="empty-state"><Wifi size={48} /><p>No se encontraron lectores con los filtros aplicados</p></div>)}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Wifi size={20} /><span>{editingLector ? 'Editar Lector' : 'Agregar Lector'}</span></h3><button onClick={closeModal} className="btn-icon"><X size={24} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label htmlFor="ubicacion"><MapPin size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />Ubicación</label><input id="ubicacion" type="text" value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} className="form-input" required placeholder="Ej: Entrada Principal"/></div>
                 <div className="form-group"><label htmlFor="estado"><Activity size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />Estado</label><select id="estado" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="form-select"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
              </div>
              <div className="modal-footer"><button type="button" onClick={closeModal} className="btn">Cancelar</button><button type="submit" className="btn btn-primary">{editingLector ? 'Actualizar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectores;