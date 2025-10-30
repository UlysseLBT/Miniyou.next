import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signUser } from '@/lib/auth'
import { z } from 'zod'

export async function POST(req) {
  const { emailOrUsername, password } = z.object({
    emailOrUsername: z.string(),
    password: z.string()
  }).parse(await req.json())

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] }
  })
  if (!user) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

  const token = signUser(user)
  const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } })
    res.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
