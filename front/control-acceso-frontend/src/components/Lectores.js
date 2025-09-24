import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, MapPin, Wifi, Activity, Loader2, Users } from 'lucide-react';
import { obtenerLectores, crearLector, actualizarLector, eliminarLector } from '../api';

const Lectores = ({ darkMode }) => {
  const [lectores, setLectores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLector, setEditingLector] = useState(null);
  const [formData, setFormData] = useState({ ubicacion: '', estado: 'Activo' });

  const fetchLectores = async () => {
    setIsLoading(true);
    try {
      const data = await obtenerLectores();
      setLectores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener lectores:", error);
      setLectores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLectores();
  }, []);

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
    try {
      if (editingLector) {
        const updatedLector = await actualizarLector(editingLector.id, formData);
        setLectores(lectores.map(l => (l.id === editingLector.id ? updatedLector : l)));
      } else {
        const newLector = await crearLector(formData);
        setLectores([...lectores, newLector]);
      }
      closeModal();
    } catch (error) {
      console.error("Error al guardar el lector:", error);
    }
  };

  const deleteLector = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lector?')) {
      try {
        await eliminarLector(id);
        setLectores(lectores.filter(l => l.id !== id));
      } catch (error) {
        console.error("Error al eliminar el lector:", error);
      }
    }
  };

  const lectoresActivos = lectores.filter(l => l.estado === 'Activo').length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Gestión de Lectores</h2>
        <p>Configura y gestiona los lectores RFID del sistema</p>
      </div>
      
      <div className="metric-grid">
        <div className="metric-card border-green">
          <div>
            <p className="title">Lectores Activos</p>
            <p className="value">{lectoresActivos}</p>
          </div>
          <Wifi size={32} className="icon" />
        </div>
        <div className="metric-card border-red">
          <div>
            <p className="title">Lectores Inactivos</p>
            <p className="value">{lectores.length - lectoresActivos}</p>
          </div>
          <Wifi size={32} className="icon" />
        </div>
        <div className="metric-card border-blue">
          <div>
            <p className="title">Total Lectores</p>
            <p className="value">{lectores.length}</p>
          </div>
          <Users size={32} className="icon" />
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          {/* Aquí puedes agregar filtros en el futuro si lo necesitas */}
        </div>
        <div className="toolbar-right">
          <button onClick={() => openModal()} className="btn btn-success">
            <Plus size={16} />
            <span>Agregar Lector</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator">
            <Loader2 className="spinner" />
            <span>Cargando lectores...</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lectores.map((lector) => (
                <tr key={lector.id}>
                  <td>#{lector.id}</td>
                  <td>{lector.ubicacion}</td>
                  <td>
                    <span className={`status-pill ${lector.estado === 'Activo' ? 'active' : 'inactive'}`}>
                      {lector.estado || 'Indefinido'}
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '0.5rem'}}>
                    <button onClick={() => openModal(lector)} className="btn-icon" title="Editar">
                      <Edit size={16} color="#3b82f6" />
                    </button>
                    <button onClick={() => deleteLector(lector.id)} className="btn-icon" title="Eliminar">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && lectores.length === 0 && (
            <div className="empty-state">
              <Wifi size={48} />
              <p>No se encontraron lectores</p>
            </div>
        )}
      </div>

      {/* --- Ventana Emergente (Modal) --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Wifi size={20} />
                <span>{editingLector ? 'Editar Lector' : 'Agregar Lector'}</span>
              </h3>
              <button onClick={closeModal} className="btn-icon"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="ubicacion">
                    <MapPin size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />
                    Ubicación
                  </label>
                  <input id="ubicacion" type="text" value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} className="form-input" required placeholder="Ej: Entrada Principal"/>
                </div>
                 <div className="form-group">
                  <label htmlFor="estado">
                    <Activity size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />
                    Estado
                  </label>
                  <select id="estado" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="form-select">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="info-box">
                    <Wifi size={20} />
                    <p style={{margin: 0}}>
                        Cada lector debe tener una ubicación única para identificarlo correctamente.
                    </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn" style={{backgroundColor: darkMode ? '#4b5563' : '#e5e7eb', color: darkMode ? 'white' : 'black'}}>Cancelar</button>
                <button type="submit" className="btn btn-success">
                  <Wifi size={16} />
                  <span>{editingLector ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectores;