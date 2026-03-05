import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assets: z.array(z.unknown()).optional(),
  status: z.string().optional()
});

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch (_error) {
    return [];
  }
}

function parseJsonUnknownArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch (_error) {
    return {};
  }
}

function mapTemplate(template: { [key: string]: unknown }) {
  const tags = typeof template.tags === 'string' ? parseJsonArray(template.tags) : [];
  const assets = typeof template.assets === 'string' ? parseJsonUnknownArray(template.assets) : [];
  const seo = template.seo && typeof template.seo === 'object'
    ? {
        ...(template.seo as Record<string, unknown>),
        structuredData: parseJsonObject(String((template.seo as Record<string, unknown>).structuredData ?? '{}'))
      }
    : null;

  return { ...template, tags, assets, seo };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await db.template.findUnique({
      where: { id: params.id },
      include: { seo: true, ratings: true }
    });

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found.' }, { status: 404 });
    }

    const ratingCount = template.ratings.length;
    const ratingTotal = template.ratings.reduce((sum, rating) => sum + rating.stars, 0);
    const average = ratingCount ? ratingTotal / ratingCount : 0;

    return NextResponse.json({
      success: true,
      data: {
        template: mapTemplate(template),
        rating: { average, count: ratingCount }
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch template.' }, { status: 400 });
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

    const template = await db.template.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        assets: data.assets ? JSON.stringify(data.assets) : undefined,
        status: data.status
      },
      include: { seo: true }
    });

    await db.auditLog.create({
      data: {
        action: 'template_update',
        entity: 'Template',
        entityId: template.id,
        userId: String(payload.id),
        metadata: JSON.stringify({ status: template.status })
      }
    });

    return NextResponse.json({ success: true, data: { template: mapTemplate(template) } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to update template.' }, { status: 400 });
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

    const template = await db.template.update({ where: { id: params.id }, data: { status: 'archived' } });

    await db.auditLog.create({
      data: {
        action: 'template_archive',
        entity: 'Template',
        entityId: template.id,
        userId: String(payload.id),
        metadata: JSON.stringify({ status: template.status })
      }
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to delete template.' }, { status: 400 });
  }
}
