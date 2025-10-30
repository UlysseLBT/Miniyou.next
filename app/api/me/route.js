import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'

export async function GET() {
  const token = getTokenFromCookies()
  if (!token) return NextResponse.json({ user: null })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ user: null })
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, username: true }
  })
  return NextResponse.json({ user })
}
