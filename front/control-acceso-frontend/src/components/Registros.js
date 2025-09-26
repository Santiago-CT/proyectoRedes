import React, { useState, useEffect } from 'react';
import { RefreshCw, User, MapPin, Clock, TrendingUp, TrendingDown, Loader2, FileText, Plus, X } from 'lucide-react';
import { obtenerRegistros, obtenerUsuarios, obtenerLectores, crearRegistro } from '../api';

const Registros = ({ darkMode }) => {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ usuarioId: '', lectorId: '' });

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [registrosData, usuariosData, lectoresData] = await Promise.all([
        obtenerRegistros(),
        obtenerUsuarios(),
        obtenerLectores(),
      ]);
      
      const formattedData = (Array.isArray(registrosData) ? registrosData : [])
        .map(r => ({ ...r, usuario: r.usuario?.nombre || 'N/A', lector: r.lector?.ubicacion || 'N/A' }))
        .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
      
      setRegistros(formattedData);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setLectores(Array.isArray(lectoresData) ? lectoresData : []);
      
      if (usuariosData.length > 0 && lectoresData.length > 0) {
        setFormData({ usuarioId: usuariosData[0].id, lectorId: lectoresData[0].id });
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSimulate = async (tipoMovimiento) => {
    if (!formData.usuarioId || !formData.lectorId) {
      alert("Por favor, selecciona un usuario y un lector.");
      return;
    }
    try {
      await crearRegistro({ ...formData, tipoMovimiento });
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      // --- CÓDIGO ACTUALIZADO PARA MOSTRAR ERRORES ---
      if (error.response && error.response.data && error.response.data.message) {
        alert("Error: " + error.response.data.message);
      } else {
        console.error("Error al crear el registro:", error);
        alert("Ocurrió un error inesperado al crear el registro.");
      }
      // --- FIN DE LA ACTUALIZACIÓN ---
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Historial de Registros</h2>
        <p>Consulta el historial de entradas y salidas del sistema.</p>
      </div>

      <div className="toolbar">
        <h3 className="font-semibold" style={{fontSize: '1.25rem'}}>Registros Recientes</h3>
        <div className="toolbar-right">
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Simular Registro</span>
          </button>
          <button onClick={cargarDatos} className="btn" disabled={isLoading} style={{backgroundColor: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? 'white' : 'black'}}>
            <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
            <span>Recargar</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator"><Loader2 className="spinner" /><span>Cargando...</span></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Lector</th>
                <th>Movimiento</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><User size={16} />{registro.usuario}</div></td>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MapPin size={16} />{registro.lector}</div></td>
                  <td><span className={`status-pill ${registro.tipoMovimiento === 'entrada' ? 'entrada' : 'salida'}`}>{registro.tipoMovimiento === 'entrada' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}{registro.tipoMovimiento}</span></td>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Clock size={16} />{new Date(registro.fechaHora).toLocaleString()}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && registros.length === 0 && (<div className="empty-state"><FileText size={48} /><p>No se encontraron registros</p></div>)}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Simular Registro de Acceso</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={24} /></button>
            </div>
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