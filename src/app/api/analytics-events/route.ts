import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const createSchema = z.object({
  templateId: z.string().optional(),
  eventType: z.enum(['view', 'preview', 'download', 'rating']),
  metadata: z.unknown().optional(),
  userId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;
    if (role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });

    const events = await db.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: { items: events, total: events.length } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch analytics events.' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const event = await db.analyticsEvent.create({
      data: {
        templateId: data.templateId || null,
        eventType: data.eventType,
        metadata: JSON.stringify(data.metadata || {}),
        userId: data.userId || null
      }
    });

    return NextResponse.json({ success: true, data: { event } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to create analytics event.' }, { status: 400 });
  }
}
