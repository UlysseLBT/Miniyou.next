import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import path from 'path'

export const runtime = 'nodejs'

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT, // met-le seulement si endpoint custom / compatible S3
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

export async function POST(req) {
  const token = getTokenFromCookies()
  const payload = token && verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  const title = form.get('title') || 'Untitled'
  const description = form.get('description') || ''
  const visibility = ['PUBLIC','UNLISTED','PRIVATE'].includes(String(form.get('visibility'))) ? String(form.get('visibility')) : 'PUBLIC'

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  // (option) sécurités simples
  const MAX_SIZE = 50 * 1024 * 1024
  const ALLOWED = ['image/jpeg','image/png','image/webp','video/mp4','video/quicktime']
  if (file.size && file.size > MAX_SIZE) return NextResponse.json({ error: 'file too large' }, { status: 413 })
  if (file.type && !ALLOWED.includes(file.type)) return NextResponse.json({ error: 'mime not allowed' }, { status: 415 })

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name || '')
  const key = `uploads/${Date.now()}-${Math.round(Math.random()*1e9)}${ext || ''}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: bytes,
    ContentType: file.type || 'application/octet-stream',
    ACL: 'public-read', // si bucket public
  }))

  const publicUrl = `${process.env.S3_PUBLIC_BASE.replace(/\/$/,'')}/${key}`
  const type = file.type?.startsWith('image/') ? 'IMAGE' : (file.type?.startsWith('video/') ? 'VIDEO' : 'OTHER')

  const media = await prisma.media.create({
    data: {
      title, description, visibility,
      path: publicUrl,               // on stocke l’URL publique directement
      mimeType: file.type || 'application/octet-stream',
      type,
      ownerId: payload.sub
    },
    select: { id: true, title: true, path: true, mimeType: true, type: true }
  })

  return NextResponse.json(media, { status: 201 })
}
