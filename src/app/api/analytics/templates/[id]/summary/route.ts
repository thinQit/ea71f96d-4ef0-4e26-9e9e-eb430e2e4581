import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

function groupByDay(events: { createdAt: Date }[]) {
  const buckets = events.reduce<Record<string, number>>((acc, event) => {
    const key = event.createdAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(buckets).map(([date, value]) => ({
    timestamp: new Date(date).toISOString(),
    value
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: { [key: string]: unknown } = { templateId: params.id };
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {})
      };
    }

    const events = await db.analyticsEvent.findMany({ where });

    const metrics = {
      views: events.filter((event) => event.eventType === 'view').length,
      previews: events.filter((event) => event.eventType === 'preview').length,
      downloads: events.filter((event) => event.eventType === 'download').length
    };

    const timeseries = groupByDay(events);

    return NextResponse.json({
      success: true,
      data: { templateId: params.id, metrics, timeseries }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch analytics summary.' }, { status: 400 });
  }
}
