export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const protectedRoutes = ['/admin', '/analytics'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    try {
      verifyToken(token);
    } catch (_error) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next();
}
