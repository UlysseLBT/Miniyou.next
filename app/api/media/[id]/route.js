import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

export async function DELETE(_req, { params }) {
  const token = getTokenFromCookies()
  const p = token && verifyToken(token)
  if (!p) return NextResponse.json({ error:'unauthorized' }, { status:401 })

  const id = Number(params.id)
  const m = await prisma.media.findUnique({ where:{ id }, select:{ ownerId:true, path:true } })
  if (!m) return NextResponse.json({ error:'not found' }, { status:404 })
  if (m.ownerId !== p.sub) return NextResponse.json({ error:'forbidden' }, { status:403 })

  // Si path est une URL de ton bucket → calcule la clé et supprime
  const base = (process.env.S3_PUBLIC_BASE || '').replace(/\/$/,'')
  if (m.path?.startsWith(base)) {
    const key = m.path.slice(base.length + 1) // après '/'
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
    } catch {}
  }

  await prisma.media.delete({ where:{ id } })
  return NextResponse.json({ ok:true })
}
