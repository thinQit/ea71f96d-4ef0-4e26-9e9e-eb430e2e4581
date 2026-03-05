import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = signToken({ id: user.id, role: user.role });
    return NextResponse.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Login failed.' }, { status: 400 });
  }
}
