import axios from "axios";

const api = axios.create({
  baseURL: "https://proyectoredes.onrender.com",
});

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

// --- FUNCIÓN AÑADIDA QUE FALTABA ---
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
  const response = await api.get(`/registros/fecha/${fecha}`);
  return response.data;
};

export const obtenerRegistrosPorLector = async (lectorId) => {
  const response = await api.get(`/registros/lector/${lectorId}`);
  return response.data;
};