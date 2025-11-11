import type { APIRoute } from 'astro';
import axios from 'axios';

const BACKEND_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    console.log('📡 /auth/login - Calling backend:', `${BACKEND_URL}/api/auth/login`);
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = response.data;
    console.log('✅ /auth/login - Backend response received');
    
    // Guardar el token en una cookie httpOnly
    if (data.token) {
      cookies.set('token', data.token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
      console.log('🍪 Token saved in httpOnly cookie');
    }

    // Devolver la respuesta del backend (sin el token por seguridad)
    return new Response(
      JSON.stringify({
        email: data.email,
        roles: data.roles,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error: any) {
    console.error('❌ /auth/login - Error:', error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Error interno del servidor';
    
    return new Response(
      JSON.stringify({ message }),
      { 
        status,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
};
