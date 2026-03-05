import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch user.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const user = await db.user.update({ where: { id: params.id }, data });

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to update user.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to delete user.' }, { status: 400 });
  }
}
