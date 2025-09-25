import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Users, Loader2, Tag } from 'lucide-react';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../api';

const Usuarios = ({ darkMode }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', documento: '', rfidTag: '' });

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        const data = await obtenerUsuarios();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setUsuarios([]); // Asegurarse de que sea un array vacío en caso de error
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const openModal = (user = null) => {
    setEditingUser(user);
    setFormData(user || { nombre: '', documento: '', rfidTag: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nombre: '', documento: '', rfidTag: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updatedUser = await actualizarUsuario(editingUser.id, formData);
        setUsuarios(usuarios.map(u => (u.id === editingUser.id ? updatedUser : u)));
      } else {
        const newUser = await crearUsuario(formData);
        setUsuarios([...usuarios, newUser]);
      }
      closeModal();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await eliminarUsuario(id);
        setUsuarios(usuarios.filter(u => u.id !== id));
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="loading-indicator">
          <Loader2 className="spinner" />
          <span>Cargando usuarios...</span>
        </div>
      );
    }

    if (usuarios.length === 0) {
      return (
        <div className="empty-state">
          <Users size={48} />
          <p>No se encontraron usuarios</p>
        </div>
      );
    }

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Documento</th>
            <th>RFID Tag</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.documento}</td>
              <td>{usuario.rfidTag || 'No asignado'}</td>
              <td style={{display: 'flex', gap: '0.5rem'}}>
                <button onClick={() => openModal(usuario)} className="btn-icon" title="Editar">
                  <Edit size={16} color="#3b82f6" />
                </button>
                <button onClick={() => deleteUser(usuario.id)} className="btn-icon" title="Eliminar">
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administra los usuarios del sistema</p>
      </div>

      <div className="toolbar">
        <h3 className="font-semibold" style={{fontSize: '1.25rem'}}>Lista de Usuarios ({usuarios.length})</h3>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Agregar Usuario</span>
        </button>
      </div>

      <div className="table-container">
        {renderTableContent()}
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
                  <label htmlFor="rfidTag">
                    <Tag size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />
                    Tag RFID
                  </label>
                  <input id="rfidTag" type="text" value={formData.rfidTag} onChange={(e) => setFormData({...formData, rfidTag: e.target.value})} className="form-input" placeholder="Ej: A1B2C3D4"/>
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