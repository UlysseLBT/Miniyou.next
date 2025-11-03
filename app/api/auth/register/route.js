import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Validation stricte + formats
const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Normalisation
    const email = parsed.data.email.trim().toLowerCase();
    const username = parsed.data.username.trim();
    const password = parsed.data.password;

    // Conflits explicites (409)
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true, email: true, username: true },
    });
    if (exists) {
      const field = exists.email === email ? 'email' : 'username';
      return NextResponse.json({ error: `Duplicate ${field}` }, { status: 409 });
    }

    // Hash (12 rounds = bon compromis)
    const passwordHash = await bcrypt.hash(password, 12);

    // ⚠️ Si ton modèle Prisma a un champ `password` (et pas `passwordHash`),
    // remplace `passwordHash` par `password` ci-dessous.
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    // Contrainte unique Prisma (par sécurité)
    if (e?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate email or username' },
        { status: 409 }
      );
    }
    console.error('REGISTER_ERROR', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ ok: true });
}
