import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  User,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  X
} from 'lucide-react';
import { obtenerRegistros, obtenerUsuarios, obtenerLectores } from '../api';

const Registros = ({ darkMode }) => {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lectores, setLectores] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioFilter, setUsuarioFilter] = useState('');
  const [lectorFilter, setLectorFilter] = useState('');
  const [tipoMovimientoFilter, setTipoMovimientoFilter] = useState('');
  const [fechaInicioFilter, setFechaInicioFilter] = useState('');
  const [fechaFinFilter, setFechaFinFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [registrosData, usuariosData, lectoresData] = await Promise.all([
          obtenerRegistros(),
          obtenerUsuarios(),
          obtenerLectores()
        ]);

        const formattedRegistros = registrosData.map(registro => ({
          ...registro,
          usuario: registro.usuario.nombre,
          lector: registro.lector.ubicacion
        }));

        setRegistros(formattedRegistros);
        setUsuarios(usuariosData);
        setLectores(lectoresData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const recargarDatos = async () => {
    setIsLoading(true);
    try {
      const [registrosData, usuariosData, lectoresData] = await Promise.all([
        obtenerRegistros(),
        obtenerUsuarios(),
        obtenerLectores()
      ]);

      const formattedRegistros = registrosData.map(registro => ({
        ...registro,
        usuario: registro.usuario.nombre,
        lector: registro.lector.ubicacion
      }));

      setRegistros(formattedRegistros);
      setUsuarios(usuariosData);
      setLectores(lectoresData);
    } catch (error) {
      console.error('Error al recargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setUsuarioFilter('');
    setLectorFilter('');
    setTipoMovimientoFilter('');
    setFechaInicioFilter('');
    setFechaFinFilter('');
    setCurrentPage(1);
  };

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = searchTerm === '' ||
      registro.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.lector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUsuario = usuarioFilter === '' ||
      registro.usuarioId.toString() === usuarioFilter;

    const matchesLector = lectorFilter === '' ||
      registro.lectorId.toString() === lectorFilter;

    const matchesTipoMovimiento = tipoMovimientoFilter === '' ||
      registro.tipoMovimiento === tipoMovimientoFilter;

    const registroFecha = new Date(registro.fechaHora).toISOString().split('T')[0];
    const matchesFechaInicio = fechaInicioFilter === '' ||
      registroFecha >= fechaInicioFilter;
    const matchesFechaFin = fechaFinFilter === '' ||
      registroFecha <= fechaFinFilter;

    return matchesSearch && matchesUsuario && matchesLector &&
           matchesTipoMovimiento && matchesFechaInicio && matchesFechaFin;
  });

  const totalPages = Math.ceil(filteredRegistros.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRegistros.slice(startIndex, endIndex);

  const totalEntradas = registros.filter(r => r.tipoMovimiento === 'Entrada').length;
  const totalSalidas = registros.filter(r => r.tipoMovimiento === 'Salida').length;
  const registrosHoy = registros.filter(r => {
    const hoy = new Date().toISOString().split('T')[0];
    return r.fechaHora.split(' ')[0] === hoy;
  }).length;

  const exportarCSV = () => {
    const csvContent = [
      ['ID', 'Usuario', 'Lector', 'Tipo Movimiento', 'Fecha y Hora'],
      ...filteredRegistros.map(registro => [
        registro.id,
        registro.usuario,
        registro.lector,
        registro.tipoMovimiento,
        registro.fechaHora
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_acceso_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% vs ayer
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color.includes('blue') ? 'text-blue-500' : color.includes('green') ? 'text-green-500' : color.includes('red') ? 'text-red-500' : 'text-yellow-500'}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Historial de Registros</h2>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Consulta el historial de entradas y salidas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard 
          title="Total Registros" 
          value={registros.length} 
          icon={FileText} 
          color="border-blue-500"
          trend={12}
        />
        <MetricCard 
          title="Entradas" 
          value={totalEntradas} 
          icon={TrendingUp} 
          color="border-green-500"
          trend={8}
        />
        <MetricCard 
          title="Salidas" 
          value={totalSalidas} 
          icon={TrendingDown} 
          color="border-red-500"
          trend={-3}
        />
        <MetricCard 
          title="Registros Hoy" 
          value={registrosHoy} 
          icon={Activity} 
          color="border-yellow-500"
          trend={15}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o lector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          <button
            onClick={recargarDatos}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recargar</span>
          </button>

          <button
            onClick={exportarCSV}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros Avanzados</span>
            </h3>
            <button
              onClick={limpiarFiltros}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuario</label>
              <select
                value={usuarioFilter}
                onChange={(e) => setUsuarioFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lector</label>
              <select
                value={lectorFilter}
                onChange={(e) => setLectorFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Todos los lectores</option>
                {lectores.map(lector => (
                  <option key={lector.id} value={lector.id}>{lector.ubicacion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo Movimiento</label>
              <select
                value={tipoMovimientoFilter}
                onChange={(e) => setTipoMovimientoFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Todos los movimientos</option>
                <option value="Entrada">Solo entradas</option>
                <option value="Salida">Solo salidas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicioFilter}
                onChange={(e) => setFechaInicioFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <input
                type="date"
                value={fechaFinFilter}
                onChange={(e) => setFechaFinFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRegistros.length)} de {filteredRegistros.length} registros
          {filteredRegistros.length !== registros.length && ` (filtrados de ${registros.length} total)`}
        </p>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Cargando registros...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Lector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Movimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {currentRecords.map((registro) => (
                  <tr key={registro.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{registro.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{registro.usuario}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{registro.lector}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 w-fit ${
                        registro.tipoMovimiento === 'Entrada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registro.tipoMovimiento === 'Entrada' ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>🔓 Entrada</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            <span>🔒 Salida</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <div>{new Date(registro.fechaHora).toLocaleDateString()}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(registro.fechaHora).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentRecords.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No se encontraron registros
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {Object.values({searchTerm, usuarioFilter, lectorFilter, tipoMovimientoFilter, fechaInicioFilter, fechaFinFilter}).some(filter => filter !== '') 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'No hay registros de acceso disponibles'
              }
            </p>
            {Object.values({searchTerm, usuarioFilter, lectorFilter, tipoMovimientoFilter, fechaInicioFilter, fechaFinFilter}).some(filter => filter !== '') && (
              <button
                onClick={limpiarFiltros}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-500 hover:text-white'
              } ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Primera
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-500 hover:text-white'
              } ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Anterior
            </button>
          </div>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-500 hover:text-white'
              } ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Siguiente
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-500 hover:text-white'
              } ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registros;