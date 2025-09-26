import React, { useState, useEffect } from 'react';
import { User, ChevronLeft, Loader2, FileText, Clock, MapPin, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { obtenerUsuarios, obtenerRegistrosPorUsuario } from '../api';

const Registros = ({ darkMode }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial de solo los usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        const usuariosData = await obtenerUsuarios();
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Carga los registros cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUser) {
      const fetchRegistros = async () => {
        setIsLoading(true);
        try {
          const registrosData = await obtenerRegistrosPorUsuario(selectedUser.id);
          const formattedData = (Array.isArray(registrosData) ? registrosData : [])
            .map(r => ({ ...r, lector: r.lector?.ubicacion || 'Lector Eliminado' }));
          setRegistros(formattedData);
        } catch (error) {
          console.error("Error al cargar registros:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRegistros();
    }
  }, [selectedUser]);

  // Vista para la lista de usuarios
  const renderUserList = () => (
    <>
      <div className="toolbar">
        <h3 className="font-semibold" style={{fontSize: '1.25rem'}}>Selecciona un Usuario</h3>
      </div>
      {isLoading ? (
        <div className="loading-indicator"><Loader2 className="spinner" /><span>Cargando usuarios...</span></div>
      ) : (
        <div className="user-list-container">
          {usuarios.map(user => (
            <div key={user.id} className="user-list-item" onClick={() => setSelectedUser(user)}>
              <Users size={24} />
              <div>
                <p className="font-semibold">{user.nombre}</p>
                <p className="text-sm text-secondary">{user.documento}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && usuarios.length === 0 && (<div className="empty-state"><Users size={48} /><p>No se encontraron usuarios</p></div>)}
    </>
  );

  // Vista para el historial de un usuario seleccionado
  const renderRecordList = () => (
    <>
      <div className="toolbar">
        <button onClick={() => setSelectedUser(null)} className="btn">
          <ChevronLeft size={16} />
          <span>Volver a Usuarios</span>
        </button>
        <h3 className="font-semibold" style={{fontSize: '1.25rem'}}>Historial de {selectedUser.nombre}</h3>
      </div>
      <div className="table-container">
        {isLoading ? (
          <div className="loading-indicator"><Loader2 className="spinner" /><span>Cargando registros...</span></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Lector</th>
                <th>Movimiento</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MapPin size={16} />{registro.lector}</div></td>
                  <td><span className={`status-pill ${registro.tipoMovimiento === 'entrada' ? 'entrada' : 'salida'}`}>{registro.tipoMovimiento === 'entrada' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}{registro.tipoMovimiento}</span></td>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Clock size={16} />{new Date(registro.fechaHora).toLocaleString()}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && registros.length === 0 && (<div className="empty-state"><FileText size={48} /><p>No se encontraron registros para este usuario</p></div>)}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2>Historial de Registros</h2>
        <p>Consulta el historial de entradas y salidas del sistema.</p>
      </div>
      {selectedUser ? renderRecordList() : renderUserList()}
    </div>
  );
};

export default Registros;