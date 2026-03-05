import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const eventSchema = z.object({
  templateId: z.string().optional(),
  eventType: z.enum(['view', 'preview', 'download', 'rating']),
  metadata: z.unknown().optional(),
  userId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = eventSchema.parse(body);

    const event = await db.analyticsEvent.create({
      data: {
        templateId: data.templateId || null,
        eventType: data.eventType,
        metadata: JSON.stringify(data.metadata || {}),
        userId: data.userId || null
      }
    });

    return NextResponse.json({ success: true, data: { recorded: true, eventId: event.id } });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to record event.' }, { status: 400 });
  }
}
