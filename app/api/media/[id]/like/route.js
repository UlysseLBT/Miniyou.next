import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function GET(_req, { params }) {
  const id = Number(params.id)
  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, path: true, mimeType: true, type: true, visibility: true,
      createdAt: true,
      ownerId: true,
      owner: { select: { id: true, username: true } },
      comments: {
        select: { id: true, content: true, createdAt: true, author: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { likes: true } }
    }
  })
  if (!media) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(media)
}

export async function DELETE(_req, { params }) {
  const token = getTokenFromCookies()
  const payload = token && verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = Number(params.id)
  const media = await prisma.media.findUnique({ where: { id }, select: { ownerId: true, path: true } })
  if (!media) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (media.ownerId !== payload.sub) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  try { await fs.unlink(path.join(process.cwd(), 'public', media.path)) } catch {}
  await prisma.media.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
