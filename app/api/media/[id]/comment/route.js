import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'

export async function POST(req, { params }) {
  const token = getTokenFromCookies()
  const payload = token && verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const id = Number(params.id)
  const c = await prisma.comment.create({
    data: { content, mediaId: id, authorId: payload.sub }
  })
  return NextResponse.json(c, { status: 201 })
}
