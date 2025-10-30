import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8)
})

export async function POST(req) {
  const data = schema.parse(await req.json())

  const exist = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] }
  })
  if (exist) return NextResponse.json({ error: 'email or username taken' }, { status: 409 })

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: await bcrypt.hash(data.password, 10)
    },
    select: { id: true, email: true, username: true }
  })

  return NextResponse.json(user, { status: 201 })
}
