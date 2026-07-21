import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];

function isPathMatch(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = isPathMatch(pathname, protectedRoutes);
  const isAdmin = isPathMatch(pathname, adminRoutes);

  if (!isProtected && !isAdmin) {
    return NextResponse.next();
  }

  let session: { user: { role?: string } } | null = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch {
    session = null;
  }

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackURL', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && session.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
