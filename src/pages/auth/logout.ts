import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Eliminar la cookie
  cookies.delete('token', {
    path: '/',
  });

  return new Response(
    JSON.stringify({ message: 'Logout exitoso' }),
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
};
