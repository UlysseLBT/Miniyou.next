// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret() {
  const s = process.env.AUTH_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(s);
}

export async function GET(req: Request) {
  const cookie = (req as any).cookies?.get?.('session')?.value
    // @ts-ignore: Next 15 req.headers cookie
    ?? (req.headers.get('cookie') || '').split('; ').find(c => c.startsWith('session='))?.split('=')[1];

  if (!cookie) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const { payload } = await jwtVerify(cookie, getSecret());
    return NextResponse.json({ user: { id: payload.uid } }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
