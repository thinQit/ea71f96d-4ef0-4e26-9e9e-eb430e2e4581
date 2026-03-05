import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    const payload = verifyToken(token);
    const userId = payload.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role } }
    });
  } catch (_error) {
    return NextResponse.json({ success: true, data: { user: null } });
  }
}
