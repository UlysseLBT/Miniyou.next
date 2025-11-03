import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const schema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

function getSecret() {
  const s = process.env.AUTH_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(s);
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { emailOrUsername, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername },
        ],
      },
      select: { id: true, passwordHash: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    // Crée un JWT simple avec l’id user
    const token = await new SignJWT({ uid: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getSecret());

    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
    res.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return res;
  } catch (e) {
    console.error('LOGIN_ERROR', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
