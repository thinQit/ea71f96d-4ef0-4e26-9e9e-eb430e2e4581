import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const createSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  metaDescription: z.string(),
  canonicalUrl: z.string(),
  structuredData: z.unknown().optional()
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const items = await db.seo.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, data: { items, total: items.length } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch SEO records.' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const seo = await db.seo.create({
      data: {
        templateId: data.templateId,
        title: data.title,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        structuredData: JSON.stringify(data.structuredData || {})
      }
    });

    return NextResponse.json({ success: true, data: { seo } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to create SEO record.' }, { status: 400 });
  }
}
