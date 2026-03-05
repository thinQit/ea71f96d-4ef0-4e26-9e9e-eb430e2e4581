import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const uploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  size: z.number().positive()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = uploadSchema.parse(body);

    const assetId = `asset_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        assetId,
        url: `${process.env.CDN_URL || 'https://cdn.templatehub.dev'}/${assetId}/${data.fileName}`,
        signedUploadUrl: `${process.env.STORAGE_ENDPOINT || 'https://uploads.templatehub.dev'}/${assetId}`
      }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Upload initialization failed.' }, { status: 400 });
  }
}
