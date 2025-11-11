import type { APIRoute } from 'astro';
import axios from 'axios';

// Desactivar prerender para esta ruta de API (server-side rendering)
export const prerender = false;

const BACKEND_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

// Proxy genérico para todas las rutas /api/*
export const ALL: APIRoute = async ({ params, request, cookies }) => {
  try {
    const path = params.path || '';
    const token = cookies.get('token')?.value;

    console.log('🔀 Proxying request for path:', path);
    console.log(`Token: ${token}`);
    
    // Construir URL del backend
    const backendUrl = `${BACKEND_URL}/api/${path}`;
    
    // Obtener método y body
    const method = request.method;
    let body = null;
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await request.json().catch(() => null);
    }
    
    // Headers base
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`📡 Proxy: ${method} /api/${path} → ${backendUrl}`);
    
    // Llamar al backend
    const response = await axios({
      method,
      url: backendUrl,
      headers,
      data: body,
      params: Object.fromEntries(new URL(request.url).searchParams),
    });
    
    // Manejar 204 No Content
    if (response.status === 204) {
      return new Response(null, {
        status: 204,
        statusText: 'No Content',
      });
    }
    
    return new Response(
      JSON.stringify(response.data),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Error en la petición';
    
    return new Response(
      JSON.stringify({ message }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// Exportar para todos los métodos HTTP
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
