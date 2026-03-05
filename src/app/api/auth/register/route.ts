import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: { email: data.email, name: data.name, passwordHash, role: 'user' }
    });

    const token = signToken({ id: user.id, role: user.role });
    return NextResponse.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 400 });
  }
}
