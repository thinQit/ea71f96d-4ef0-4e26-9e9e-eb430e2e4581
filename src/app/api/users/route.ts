import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    const payload = verifyToken(token);
    const role = payload.role as string | undefined;

    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '10');

    const [users, total] = await Promise.all([
      db.user.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      db.user.count()
    ]);

    const userIds = users.map((user) => user.id);
    const lastEvents = await db.analyticsEvent.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' }
    });

    const lastActivityMap = lastEvents.reduce<Record<string, string>>((acc, event) => {
      if (!event.userId || acc[event.userId]) return acc;
      acc[event.userId] = event.createdAt.toISOString();
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        items: users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          lastActivity: lastActivityMap[user.id] || null
        })),
        total,
        page,
        pageSize
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to fetch users.' }, { status: 400 });
  }
}
