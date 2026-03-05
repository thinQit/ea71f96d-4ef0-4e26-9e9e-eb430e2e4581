import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  structuredData: z.unknown().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const seo = await db.seo.findUnique({ where: { id: params.id } });
    if (!seo) return NextResponse.json({ success: false, error: 'SEO record not found.' }, { status: 404 });

    return NextResponse.json({ success: true, data: { seo } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch SEO record.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const seo = await db.seo.update({
      where: { id: params.id },
      data: {
        title: data.title,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        structuredData: data.structuredData ? JSON.stringify(data.structuredData) : undefined
      }
    });

    return NextResponse.json({ success: true, data: { seo } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to update SEO record.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    await db.seo.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to delete SEO record.' }, { status: 400 });
  }
}
