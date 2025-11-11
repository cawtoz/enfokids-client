import { defineMiddleware } from 'astro:middleware';

const BACKEND_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

export const onRequest = defineMiddleware(async ({ locals, url, cookies, redirect }, next) => {
  const token = cookies.get('token')?.value;
  let user = null;

  if (token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        user = await response.json();
        (locals as any).user = user;
      } else {
        cookies.delete('token', { path: '/' });
      }
    } catch (error) {
      cookies.delete('token', { path: '/' });
    }
  }

  const isAuthenticated = user !== null;
  const pathname = url.pathname;

  const publicRoutes = ['/', '/login', '/auth/login', '/auth/logout'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isAuthenticated && pathname === '/login') {
    return redirect('/inicio');
  }

  if (!isAuthenticated && !isPublicRoute && !pathname.startsWith('/api/') && !pathname.startsWith('/auth/')) {
    return redirect('/login');
  }

  return next();
});
