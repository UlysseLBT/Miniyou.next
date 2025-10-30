import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50)
  const skip = (page - 1) * limit
  const tag = searchParams.get('tag') || null

  const where = { visibility: 'PUBLIC' }
  if (tag) where.tags = { some: { tag: { name: tag } } }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      select: {
        id: true, title: true, description: true, path: true, mimeType: true, type: true, createdAt: true,
        owner: { select: { id: true, username: true } },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { likes: true, comments: true } }
      }
    }),
    prisma.media.count({ where })
  ])
  return NextResponse.json({ items, page, limit, total, pages: Math.ceil(total/limit) })
}
