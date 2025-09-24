import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:8080",
  baseURL: "http://192.168.128.10:8080",
});

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

export const obtenerRegistros = async () => {
  const response = await api.get("/registros");
  return response.data;
};
export const crearRegistro = async (registro) => {
  const response = await api.post("/registros", registro);
  return response.data;
};