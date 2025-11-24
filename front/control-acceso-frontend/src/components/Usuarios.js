import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Users, Loader2, Tag, Power, PowerOff, Search } from 'lucide-react';
import { 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario,
  obtenerUltimoTagDesconocido // <--- Nueva función importada
} from '../api';

const Usuarios = ({ initialData, reloadData, darkMode }) => {
  const [usuarios, setUsuarios] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', documento: '', rfidTag: '', estado: 'Activo' });
  const [searchTerm, setSearchTerm] = useState('');

  // Sincroniza el estado del componente si los datos de App.js cambian
  useEffect(() => {
    setUsuarios(initialData);
  }, [initialData]);

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

  const handleAction = async (action) => {
    setIsLoading(true);
    try {
      await action();
      await reloadData(); // Llama a la función de App.js para recargar todo
    } catch (error) {
      console.error("Ocurrió un error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleAction(async () => {
      if (editingUser) {
        await actualizarUsuario(editingUser.id, formData);
      } else {
        await crearUsuario(formData);
      }
      closeModal();
    });
  };

  // --- NUEVA FUNCIÓN: Capturar Tag del Backend ---
  const handleCapturarTag = async () => {
    try {
      const data = await obtenerUltimoTagDesconocido();
      if (data && data.rfidTag) {
        setFormData(prev => ({ ...prev, rfidTag: data.rfidTag }));
        alert("¡Tag capturado exitosamente!");
      }
    } catch (error) {
      // Si el backend devuelve 404, es que no hay tags recientes
      alert("No se detectó ningún tag reciente. Pasa una tarjeta por el lector primero.");
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
    if (window.confirm(`¿Estás seguro de cambiar el estado de ${user.nombre} a ${newStatus}?`)) {
      handleAction(async () => await actualizarUsuario(user.id, { ...user, estado: newStatus }));
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? ESTA ACCIÓN BORRARÁ TODOS SUS REGISTROS DE FORMA PERMANENTE.')) {
      handleAction(async () => await eliminarUsuario(id));
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const term = searchTerm.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(term) ||
      usuario.documento.toLowerCase().includes(term) ||
      (usuario.rfidTag && usuario.rfidTag.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administra los usuarios del sistema, su estado y sus datos.</p>
      </div>
      <div className="toolbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o RFID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Agregar Usuario</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {searchTerm ? `Resultados: ${filteredUsuarios.length}` : `Total de Usuarios: ${usuarios.length}`}
        </h3>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator"><Loader2 className="spinner" /></div>
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
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.documento}</td>
                  <td>{usuario.rfidTag || 'No asignado'}</td>
                  <td><span className={`status-pill ${usuario.estado === 'Activo' ? 'active' : 'inactive'}`}>{usuario.estado}</span></td>
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
        {!isLoading && filteredUsuarios.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>{searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}</p>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h3><button onClick={closeModal} className="btn-icon"><X size={24} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label htmlFor="nombre">Nombre</label><input id="nombre" type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="form-input" required/></div>
                <div className="form-group"><label htmlFor="documento">Documento</label><input id="documento" type="text" value={formData.documento} onChange={(e) => setFormData({...formData, documento: e.target.value})} className="form-input" required/></div>
                
                {/* --- CAMPO DE RFID CON BOTÓN DE CAPTURA --- */}
                <div className="form-group">
                    <label htmlFor="rfidTag"><Tag size={14} style={{display: 'inline-block', marginRight: '0.25rem'}} />Tag RFID</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                            id="rfidTag" 
                            type="text" 
                            value={formData.rfidTag || ''} 
                            onChange={(e) => setFormData({...formData, rfidTag: e.target.value})} 
                            className="form-input" 
                            placeholder="Ej: A1B2C3D4"
                        />
                        <button type="button" onClick={handleCapturarTag} className="btn btn-secondary" title="Capturar del lector">
                            <Tag size={16} />
                            <span>Capturar</span>
                        </button>
                    </div>
                </div>

                <div className="form-group"><label htmlFor="estado">Estado</label><select id="estado" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="form-select"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
              </div>
              <div className="modal-footer"><button type="button" onClick={closeModal} className="btn">Cancelar</button><button type="submit" className="btn btn-primary">{editingUser ? 'Actualizar' : 'Crear'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;