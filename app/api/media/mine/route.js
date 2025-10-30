import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'

export async function GET() {
  const token = getTokenFromCookies()
  const p = token && verifyToken(token)
  if (!p) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const items = await prisma.media.findMany({
    where: { ownerId: p.sub }, orderBy: { createdAt: 'desc' },
    select: { id:true, title:true, path:true, type:true, createdAt:true }
  })
  return NextResponse.json({ items })
}
