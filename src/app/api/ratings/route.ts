import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const createSchema = z.object({
  templateId: z.string(),
  stars: z.number().min(1).max(5),
  comment: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      const token = getTokenFromHeader(request.headers.get('authorization'));
      if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
      const payload = verifyToken(token);
      const role = payload.role as string | undefined;
      if (role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const ratings = await db.rating.findMany({ where: templateId ? { templateId } : {} });
    return NextResponse.json({ success: true, data: { items: ratings, total: ratings.length } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch ratings.' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const userId = payload.id as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const body = await request.json();
    const data = createSchema.parse(body);

    const rating = await db.rating.create({
      data: {
        templateId: data.templateId,
        userId,
        stars: data.stars,
        comment: data.comment || null
      }
    });

    return NextResponse.json({ success: true, data: { rating } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to create rating.' }, { status: 400 });
  }
}
