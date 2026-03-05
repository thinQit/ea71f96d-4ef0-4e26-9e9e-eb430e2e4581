import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const previewSchema = z.object({
  versionId: z.string().optional(),
  device: z.enum(['desktop', 'tablet', 'mobile']).optional()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await db.template.findUnique({ where: { id: params.id } });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found.' }, { status: 404 });
    }

    const body = await request.json();
    const data = previewSchema.parse(body);
    const device = data.device || 'desktop';

    let userId: string | null = null;
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (token) {
      try {
        const payload = verifyToken(token);
        userId = typeof payload.id === 'string' ? payload.id : null;
      } catch (_error) {
        userId = null;
      }
    }

    await db.analyticsEvent.create({
      data: {
        templateId: template.id,
        eventType: 'preview',
        metadata: JSON.stringify({ device, versionId: data.versionId || null }),
        userId
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        previewUrl: `https://preview.templatehub.dev/${template.slug}?device=${device}`,
        expiry: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        width: device === 'mobile' ? 390 : device === 'tablet' ? 768 : 1280,
        height: device === 'mobile' ? 844 : device === 'tablet' ? 1024 : 720
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Unable to create preview.' }, { status: 400 });
  }
}
