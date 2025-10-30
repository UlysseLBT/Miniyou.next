'use client'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setMe(d.user))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    location.href = '/'
  }

  return (
    <header className="container mx-auto p-6 flex items-center justify-between">
      <a href="/" className="text-xl font-bold">MiniYou</a>
      <nav className="flex gap-2">
        <a className="btn" href="/upload">Upload</a>
        {me ? (
          <>
            <a className="btn" href="/profile">@{me.username}</a>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <a className="btn" href="/login">Login</a>
            <a className="btn" href="/register">Register</a>
          </>
        )}
      </nav>
    </header>
  )
}
