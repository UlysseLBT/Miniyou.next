import jwt, { JwtPayload } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET as string

export type TokenPayload = JwtPayload & { sub: number; email: string; username: string }

export function signUser(user: { id: number; email: string; username: string }) {
  return jwt.sign({ sub: user.id, email: user.email, username: user.username }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getTokenFromCookies() {
  return (await cookies()).get('token')?.value || null
}
