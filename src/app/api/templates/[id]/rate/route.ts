import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const rateSchema = z.object({
  stars: z.number().min(1).max(5),
  comment: z.string().optional()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const payload = verifyToken(token);
    const userId = payload.id as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

    const template = await db.template.findUnique({ where: { id: params.id } });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found.' }, { status: 404 });
    }

    const body = await request.json();
    const data = rateSchema.parse(body);

    const rating = await db.rating.create({
      data: { templateId: params.id, userId, stars: data.stars, comment: data.comment || null }
    });

    const allRatings = await db.rating.findMany({ where: { templateId: params.id } });
    const total = allRatings.reduce((sum, item) => sum + item.stars, 0);
    const average = allRatings.length ? total / allRatings.length : 0;

    await db.analyticsEvent.create({
      data: { templateId: params.id, eventType: 'rating', metadata: JSON.stringify({ stars: data.stars }), userId }
    });

    return NextResponse.json({
      success: true,
      data: { rating, newAverage: average, newCount: allRatings.length }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to submit rating.' }, { status: 400 });
  }
}
