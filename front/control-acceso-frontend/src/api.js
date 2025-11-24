import axios from "axios";

// --- CONFIGURACIÓN DINÁMICA DE LA URL BASE ---
// Si la app está en producción, usa la URL de Render.
// Si está en desarrollo, usa localhost.
const baseURL = process.env.NODE_ENV === 'production'
  ? "https://proyectoredes.onrender.com"
  : "http://localhost:8080";

const api = axios.create({
  baseURL: baseURL,
});


// --- INTERCEPTOR DE AUTENTICACIÓN ---
// Este código se ejecuta en cada petición que hace la aplicación.
// Revisa si hay un token guardado y lo añade a la cabecera 'Authorization'.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // El formato 'Bearer ' es un estándar para enviar tokens JWT
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// --- AUTENTICACIÓN ---
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data; // Devuelve el token
};


// --- USUARIOS ---
export const obtenerUsuarios = async () => {
  const response = await api.get("/usuarios");
  return response.data;
};

export const crearUsuario = async (usuario) => {
  const response = await api.post("/usuarios", usuario);
  return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
  const response = await api.put(`/usuarios/${id}`, usuario);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  await api.delete(`/usuarios/${id}`);
};

export const obtenerUsuariosActivos = async () => {
  const response = await api.get("/usuarios/activos");
  return response.data;
};


// --- LECTORES ---
export const obtenerLectores = async () => {
  const response = await api.get("/lectores");
  return response.data;
};

export const crearLector = async (lector) => {
  const response = await api.post("/lectores", lector);
  return response.data;
};

export const actualizarLector = async (id, lector) => {
  const response = await api.put(`/lectores/${id}`, lector);
  return response.data;
};

export const eliminarLector = async (id) => {
  await api.delete(`/lectores/${id}`);
};

export const obtenerLectoresActivos = async () => {
  const response = await api.get("/lectores/activos");
  return response.data;
};

export const obtenerLectoresConRegistros = async () => {
  const response = await api.get("/lectores/con-registros");
  return response.data;
};


// --- REGISTROS ---
export const obtenerRegistros = async () => {
  const response = await api.get("/registros");
  return response.data;
};

export const crearRegistro = async (registro) => {
  const response = await api.post("/registros", registro);
  return response.data;
};

export const obtenerRegistrosPorUsuario = async (usuarioId) => {
  const response = await api.get(`/registros/usuario/${usuarioId}`);
  return response.data;
};

export const obtenerRegistrosPorFecha = async (fecha) => {
  // 'fecha' debe ser un string en formato YYYY-MM-DD
  const response = await api.get(`/registros/fecha/${fecha}`);
  return response.data;
};

export const obtenerRegistrosPorLector = async (lectorId) => {
  const response = await api.get(`/registros/lector/${lectorId}`);
  return response.data;
};
export const obtenerUltimoTagDesconocido = async () => {
  const response = await api.get("/registros/ultimo-desconocido");
  return response.data;
};