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
  const isChild = user?.roles?.includes('CHILD');
  const isCaregiver = user?.roles?.includes('CAREGIVER');
  const pathname = url.pathname;

  const publicRoutes = ['/', '/login', '/auth/login', '/auth/logout'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const adminOnlyRoutes = ['/actividades', '/planes-actividades', '/ninos', '/terapeutas', '/cuidadores', '/asignaciones', '/inicio'];

  // Redirect from login to correct dashboard based on role
  if (isAuthenticated && pathname === '/login') {
    if (isChild) return redirect('/inicio-nino');
    if (isCaregiver) return redirect('/inicio-cuidador');
    return redirect('/inicio');
  }

  // Protect admin routes from children
  if (isAuthenticated && isChild && adminOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return redirect('/inicio-nino');
  }

  // Protect admin routes from caregivers
  if (isAuthenticated && isCaregiver && adminOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return redirect('/inicio-cuidador');
  }

  // Protect child routes from non-children
  if (isAuthenticated && !isChild && pathname.startsWith('/inicio-nino')) {
    return redirect(isCaregiver ? '/inicio-cuidador' : '/inicio');
  }

  // Protect caregiver routes from non-caregivers
  if (isAuthenticated && !isCaregiver && pathname.startsWith('/inicio-cuidador')) {
    return redirect(isChild ? '/inicio-nino' : '/inicio');
  }

  // General authentication check
  if (!isAuthenticated && !isPublicRoute && !pathname.startsWith('/api/') && !pathname.startsWith('/auth/')) {
    return redirect('/login');
  }

  return next();
});
