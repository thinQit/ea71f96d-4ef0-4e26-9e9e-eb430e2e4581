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

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assets: z.array(z.unknown()).optional(),
  seo: seoSchema.optional(),
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '10');
    const minRating = Number(searchParams.get('minRating') || '0');
    const sort = searchParams.get('sort') || 'updatedAt_desc';

    const tagsParam = searchParams.getAll('tags');
    const tags = tagsParam.length > 0
      ? tagsParam.flatMap((tag) => tag.split(',').map((entry) => entry.trim()).filter(Boolean))
      : [];

    const [sortField, sortOrder] = sort.split('_');
    const orderBy = ['title', 'createdAt', 'updatedAt'].includes(sortField)
      ? { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { updatedAt: 'desc' };

    const where: { [key: string]: unknown } = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const templates = await db.template.findMany({ where, include: { seo: true }, orderBy });

    const ratings = await db.rating.findMany({
      where: { templateId: { in: templates.map((template) => template.id) } }
    });

    const ratingMap = ratings.reduce<Record<string, { total: number; count: number }>>((acc, rating) => {
      const existing = acc[rating.templateId] || { total: 0, count: 0 };
      acc[rating.templateId] = { total: existing.total + rating.stars, count: existing.count + 1 };
      return acc;
    }, {});

    const filtered = templates.filter((template) => {
      const tagList = parseJsonArray(template.tags);
      const rating = ratingMap[template.id];
      const average = rating ? rating.total / rating.count : 0;

      if (tags.length > 0 && !tags.some((tag) => tagList.includes(tag))) return false;
      if (minRating > 0 && average < minRating) return false;
      return true;
    });

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize).map((template) => mapTemplate(template));

    return NextResponse.json({
      success: true,
      data: { items: paginated, total, page, pageSize }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch templates.' }, { status: 400 });
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

    const template = await db.template.create({
      data: {
        title: data.title,
        slug: slugify(data.title),
        description: data.description || '',
        category: data.category || 'Uncategorized',
        tags: JSON.stringify(data.tags || []),
        assets: JSON.stringify(data.assets || []),
        status: data.status || 'draft',
        createdBy: String(payload.id),
        seo: data.seo
          ? {
              create: {
                title: data.seo.title || data.title,
                metaDescription: data.seo.metaDescription || '',
                canonicalUrl: data.seo.canonicalUrl || '',
                structuredData: JSON.stringify(data.seo.structuredData || {})
              }
            }
          : undefined
      },
      include: { seo: true }
    });

    await db.auditLog.create({
      data: {
        action: 'template_create',
        entity: 'Template',
        entityId: template.id,
        userId: String(payload.id),
        metadata: JSON.stringify({ status: template.status })
      }
    });

    return NextResponse.json({ success: true, data: { template: mapTemplate(template) } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to create template.' }, { status: 400 });
  }
}
