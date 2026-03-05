import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });

    const event = await db.analyticsEvent.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });

    return NextResponse.json({ success: true, data: { event } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch analytics event.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });

    await db.analyticsEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to delete analytics event.' }, { status: 400 });
  }
}
