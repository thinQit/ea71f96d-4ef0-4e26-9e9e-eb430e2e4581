import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const updateSchema = z.object({
  stars: z.number().min(1).max(5).optional(),
  comment: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rating = await db.rating.findUnique({ where: { id: params.id } });
    if (!rating) return NextResponse.json({ success: false, error: 'Rating not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: { rating } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch rating.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);

    const rating = await db.rating.findUnique({ where: { id: params.id } });
    if (!rating) return NextResponse.json({ success: false, error: 'Rating not found.' }, { status: 404 });

    const role = payload.role as string | undefined;
    const userId = payload.id as string | undefined;
    if (role !== 'admin' && rating.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await db.rating.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: { rating: updated } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to update rating.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);

    const rating = await db.rating.findUnique({ where: { id: params.id } });
    if (!rating) return NextResponse.json({ success: false, error: 'Rating not found.' }, { status: 404 });

    const role = payload.role as string | undefined;
    const userId = payload.id as string | undefined;
    if (role !== 'admin' && rating.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    await db.rating.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to delete rating.' }, { status: 400 });
  }
}
