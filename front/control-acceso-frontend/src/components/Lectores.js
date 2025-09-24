import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, MapPin, Wifi, Activity } from 'lucide-react';
import { obtenerLectores, crearLector, actualizarLector, eliminarLector } from '../api';

const Lectores = ({ darkMode }) => {
  const [lectores, setLectores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLector, setEditingLector] = useState(null);
  const [formData, setFormData] = useState({ ubicacion: '', estado: 'Activo' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    obtenerLectores().then(setLectores);
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

    const newLectorData = {
      ...formData,
      ultimaActividad: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    if (editingLector) {
      await actualizarLector(editingLector.id, formData);
      setLectores(lectores.map(l => 
        l.id === editingLector.id 
          ? { ...editingLector, ...newLectorData } 
          : l
      ));
    } else {
      const newLector = await crearLector(formData);
      setLectores([...lectores, newLector]);
    }

    closeModal();
  };

  const deleteLector = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lector?')) {
      await eliminarLector(id);
      setLectores(lectores.filter(l => l.id !== id));
    }
  };

  const toggleEstado = async (id) => {
    const lector = lectores.find(l => l.id === id);
    const nuevoEstado = lector.estado === 'Activo' ? 'Inactivo' : 'Activo';

    await actualizarLector(id, { ...lector, estado: nuevoEstado });
    setLectores(lectores.map(l => 
      l.id === id 
        ? { ...l, estado: nuevoEstado, ultimaActividad: new Date().toISOString().slice(0, 19).replace('T', ' ') }
        : l
    ));
  };

  const filteredLectores = lectores.filter(lector => {
    const matchesSearch = searchTerm === '' || 
      lector.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || 
      lector.estado.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const lectoresActivos = lectores.filter(l => l.estado === 'Activo').length;
  const lectoresInactivos = lectores.filter(l => l.estado === 'Inactivo').length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Gestión de Lectores</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Configura y gestiona los lectores RFID
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-green-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lectores Activos</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{lectoresActivos}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-red-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lectores Inactivos</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{lectoresInactivos}</p>
            </div>
            <Wifi className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Lectores</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{lectores.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Solo activos</option>
            <option value="inactivo">Solo inactivos</option>
          </select>
        </div>

        <button 
          onClick={() => openModal()}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Lector</span>
        </button>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Última Actividad</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredLectores.map((lector) => (
                <tr key={lector.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{lector.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{lector.ubicacion}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleEstado(lector.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                          lector.estado === 'Activo'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {lector.estado}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span>{new Date(lector.ultimaActividad).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => openModal(lector)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      title="Editar lector"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteLector(lector.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Eliminar lector"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLectores.length === 0 && (
          <div className="text-center py-8">
            <Wifi className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No se encontraron lectores
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agregando tu primer lector RFID'
              }
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Wifi className="w-5 h-5" />
                <span>{editingLector ? 'Editar Lector' : 'Agregar Lector'}</span>
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  placeholder="Ej: Entrada Principal, Sala de Servidores..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-start space-x-2">
                  <Wifi className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Información importante:
                    </p>
                    <p className={`${darkMode ? 'text-blue-200' : 'text-blue-700'} mt-1`}>
                      Cada lector debe tener una ubicación única para identificarlo correctamente en el sistema.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Wifi className="w-4 h-4" />
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