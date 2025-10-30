import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET

export function signUser(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, username: user.username },
    SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET) } catch { return null }
}

export function getTokenFromCookies() {
  return cookies().get('token')?.value || null
}
