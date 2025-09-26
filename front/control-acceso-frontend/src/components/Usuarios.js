import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Users, Loader2, Tag, Power, PowerOff } from 'lucide-react';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../api';

const Usuarios = ({ darkMode }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', documento: '', rfidTag: '', estado: 'Activo' });

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const openModal = (user = null) => {
    setEditingUser(user);
    setFormData(user ? { ...user } : { nombre: '', documento: '', rfidTag: '', estado: 'Activo' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nombre: '', documento: '', rfidTag: '', estado: 'Activo' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await actualizarUsuario(editingUser.id, formData);
      } else {
        await crearUsuario(formData);
      }
      fetchUsuarios(); // Recargar la lista de usuarios
      closeModal();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
    if (window.confirm(`¿Estás seguro de cambiar el estado de ${user.nombre} a ${newStatus}?`)) {
      try {
        await actualizarUsuario(user.id, { ...user, estado: newStatus });
        fetchUsuarios();
      } catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
      }
    }
  };
  
  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? ESTA ACCIÓN BORRARÁ TODOS SUS REGISTROS DE FORMA PERMANENTE.')) {
      try {
        await eliminarUsuario(id);
        fetchUsuarios();
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administra los usuarios del sistema, su estado y sus datos.</p>
      </div>

      <div className="toolbar">
        <h3 className="font-semibold" style={{fontSize: '1.25rem'}}>Lista de Usuarios ({usuarios.length})</h3>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Agregar Usuario</span>
        </button>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator"><Loader2 className="spinner" /><span>Cargando usuarios...</span></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>RFID Tag</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.documento}</td>
                  <td>{usuario.rfidTag || 'No asignado'}</td>
                  <td>
                    <span className={`status-pill ${usuario.estado === 'Activo' ? 'active' : 'inactive'}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '0.5rem'}}>
                    <button onClick={() => toggleUserStatus(usuario)} className="btn-icon" title={usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}>
                      {usuario.estado === 'Activo' ? <PowerOff size={16} color="#f59e0b" /> : <Power size={16} color="#10b981" />}
                    </button>
                    <button onClick={() => openModal(usuario)} className="btn-icon" title="Editar">
                      <Edit size={16} color="#3b82f6" />
                    </button>
                    <button onClick={() => deleteUser(usuario.id)} className="btn-icon" title="Eliminar Permanentemente">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
         {!isLoading && usuarios.length === 0 && (<div className="empty-state"><Users size={48} /><p>No se encontraron usuarios</p></div>)}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
              <button onClick={closeModal} className="btn-icon"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input id="nombre" type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="form-input" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="documento">Documento</label>
                  <input id="documento" type="text" value={formData.documento} onChange={(e) => setFormData({...formData, documento: e.target.value})} className="form-input" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="rfidTag"><Tag size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />Tag RFID</label>
                  <input id="rfidTag" type="text" value={formData.rfidTag} onChange={(e) => setFormData({...formData, rfidTag: e.target.value})} className="form-input" placeholder="Ej: A1B2C3D4"/>
                </div>
                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select id="estado" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="form-select">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;