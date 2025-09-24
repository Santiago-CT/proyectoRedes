import React, { useState } from 'react';

// Componente simple sin Tailwind - solo CSS inline y básico
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const sidebarStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '250px',
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 40,
    padding: '20px',
    transition: 'all 0.3s ease'
  };

  const mainContentStyle = {
    marginLeft: '250px',
    padding: '30px',
    backgroundColor: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh',
    color: darkMode ? '#ffffff' : '#000000',
    transition: 'all 0.3s ease'
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const menuButtonStyle = (isActive) => ({
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : darkMode ? '#d1d5db' : '#374151',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: darkMode ? '#374151' : '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const thStyle = {
    backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: darkMode ? '#d1d5db' : '#374151'
  };

  const tdStyle = {
    padding: '12px 16px',
    borderTop: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    fontSize: '14px'
  };

  // Datos mock
  const usuarios = [
    { id: 1, nombre: 'Juan Pérez', documento: '12345678' },
    { id: 2, nombre: 'María García', documento: '87654321' },
    { id: 3, nombre: 'Carlos López', documento: '11223344' },
  ];

  const lectores = [
    { id: 1, ubicacion: 'Entrada Principal', estado: 'Activo' },
    { id: 2, ubicacion: 'Sala de Servidores', estado: 'Activo' },
    { id: 3, ubicacion: 'Oficina Administrativa', estado: 'Inactivo' },
  ];

  const registros = [
    { id: 1, usuario: 'Juan Pérez', lector: 'Entrada Principal', tipo: 'Entrada', fecha: '2024-01-15 08:30:00' },
    { id: 2, usuario: 'María García', lector: 'Sala de Servidores', tipo: 'Entrada', fecha: '2024-01-15 09:15:00' },
    { id: 3, usuario: 'Carlos López', lector: 'Oficina Administrativa', tipo: 'Salida', fecha: '2024-01-15 12:30:00' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Dashboard Principal</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Usuarios</h3>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{usuarios.length}</p>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: darkMode ? '#9ca3af' : '#6b7280' }}>Total Lectores</h3>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{lectores.length}</p>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: darkMode ? '#9ca3af' : '#6b7280' }}>Registros Hoy</h3>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{registros.length}</p>
              </div>
            </div>
            <div style={cardStyle}>
              <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Últimos Movimientos</h2>
              {registros.slice(0, 3).map(registro => (
                <div key={registro.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{registro.usuario}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>{registro.lector}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '500', color: registro.tipo === 'Entrada' ? '#10b981' : '#ef4444' }}>
                      {registro.tipo}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {new Date(registro.fecha).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Gestión de Usuarios</h1>
              <button style={buttonStyle}>Agregar Usuario</button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Documento</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td style={tdStyle}>{usuario.id}</td>
                    <td style={tdStyle}>{usuario.nombre}</td>
                    <td style={tdStyle}>{usuario.documento}</td>
                    <td style={tdStyle}>
                      <button style={{ ...buttonStyle, marginRight: '8px', fontSize: '12px', padding: '6px 12px' }}>Editar</button>
                      <button style={{ ...buttonStyle, backgroundColor: '#ef4444', fontSize: '12px', padding: '6px 12px' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'lectores':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Gestión de Lectores</h1>
              <button style={{ ...buttonStyle, backgroundColor: '#10b981' }}>Agregar Lector</button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Ubicación</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lectores.map(lector => (
                  <tr key={lector.id}>
                    <td style={tdStyle}>{lector.id}</td>
                    <td style={tdStyle}>{lector.ubicacion}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: lector.estado === 'Activo' ? '#dcfce7' : '#fee2e2',
                        color: lector.estado === 'Activo' ? '#166534' : '#991b1b'
                      }}>
                        {lector.estado}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button style={{ ...buttonStyle, marginRight: '8px', fontSize: '12px', padding: '6px 12px' }}>Editar</button>
                      <button style={{ ...buttonStyle, backgroundColor: '#ef4444', fontSize: '12px', padding: '6px 12px' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'registros':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Historial de Registros</h1>
              <button style={{ ...buttonStyle, backgroundColor: '#8b5cf6' }}>Exportar</button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Lector</th>
                  <th style={thStyle}>Movimiento</th>
                  <th style={thStyle}>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(registro => (
                  <tr key={registro.id}>
                    <td style={tdStyle}>{registro.id}</td>
                    <td style={tdStyle}>{registro.usuario}</td>
                    <td style={tdStyle}>{registro.lector}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: registro.tipo === 'Entrada' ? '#dcfce7' : '#fee2e2',
                        color: registro.tipo === 'Entrada' ? '#166534' : '#991b1b'
                      }}>
                        {registro.tipo === 'Entrada' ? '🔓 Entrada' : '🔒 Salida'}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(registro.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Selecciona una sección</div>;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Control de Acceso</h1>
        </div>
        
        <nav>
          <button
            style={menuButtonStyle(activeSection === 'dashboard')}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            style={menuButtonStyle(activeSection === 'usuarios')}
            onClick={() => setActiveSection('usuarios')}
          >
            👤 Usuarios
          </button>
          <button
            style={menuButtonStyle(activeSection === 'lectores')}
            onClick={() => setActiveSection('lectores')}
          >
            📡 Lectores
          </button>
          <button
            style={menuButtonStyle(activeSection === 'registros')}
            onClick={() => setActiveSection('registros')}
          >
            📑 Registros
          </button>
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              ...buttonStyle,
              width: '100%',
              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
              color: darkMode ? '#fbbf24' : '#374151'
            }}
          >
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;