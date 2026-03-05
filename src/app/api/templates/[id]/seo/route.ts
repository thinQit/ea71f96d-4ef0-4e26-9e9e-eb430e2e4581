import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const seoSchema = z.object({
  title: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  structuredData: z.unknown().optional()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (!role || !['admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const data = seoSchema.parse(body);

    const template = await db.template.findUnique({ where: { id: params.id }, include: { seo: true } });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found.' }, { status: 404 });
    }

    const seo = template.seo
      ? await db.seo.update({
          where: { id: template.seo.id },
          data: {
            title: data.title ?? template.seo.title,
            metaDescription: data.metaDescription ?? template.seo.metaDescription,
            canonicalUrl: data.canonicalUrl ?? template.seo.canonicalUrl,
            structuredData: JSON.stringify(data.structuredData ?? JSON.parse(template.seo.structuredData || '{}'))
          }
        })
      : await db.seo.create({
          data: {
            templateId: template.id,
            title: data.title || template.title,
            metaDescription: data.metaDescription || '',
            canonicalUrl: data.canonicalUrl || '',
            structuredData: JSON.stringify(data.structuredData || {})
          }
        });

    await db.auditLog.create({
      data: {
        action: 'template_seo_update',
        entity: 'Template',
        entityId: template.id,
        userId: String(payload.id),
        metadata: JSON.stringify({ seoId: seo.id })
      }
    });

    return NextResponse.json({ success: true, data: { seo } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to update SEO.' }, { status: 400 });
  }
}
