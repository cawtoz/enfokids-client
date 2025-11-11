import axios, { AxiosError } from 'axios';

// Detectar si estamos en el servidor o el navegador
const isServer = typeof window === 'undefined';
const baseURL = isServer ? 'http://localhost:4321' : ''; // En servidor, usar URL completa del proxy de Astro

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Extraer mensaje de error del backend
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error en la petición';

    // Re-lanzar error con mensaje personalizado
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
