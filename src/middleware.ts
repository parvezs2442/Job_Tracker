import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const url = request.nextUrl.clone();
  
  const isApiRoute = url.pathname.startsWith('/api');
  const isAuthRoute = url.pathname === '/login' || url.pathname === '/register';
  const isAuthApi = url.pathname.startsWith('/api/auth');

  // Verify and decode token expiration in edge runtime
  const isTokenValid = token ? checkTokenExpiry(token) : false;

  if (!isTokenValid) {
    // If not authenticated
    if (isApiRoute) {
      // Exclude authentication api routes from block
      if (!isAuthApi) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    } else if (!isAuthRoute) {
      // Redirect to login if accessing a protected page
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // If authenticated, prevent access to login/register pages
    if (isAuthRoute) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

function checkTokenExpiry(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const data = JSON.parse(jsonPayload);
    
    // Check if token has expired
    if (data.exp && Date.now() >= data.exp * 1000) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg files, images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
