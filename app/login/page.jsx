'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Login() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  // tu peux passer ?redirectTo=/profile dans l'URL si tu veux
  const redirectTo = params.get('redirectTo')

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    const body = Object.fromEntries(new FormData(e.currentTarget))

    // important: credentials:'include' pour être sûr que le cookie est bien pris
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    })

    if (r.ok) {
      // on vérifie que le cookie est bien posé, puis on choisit la destination
      const meRes = await fetch('/api/me', { cache: 'no-store', credentials: 'include' })
      const me = await meRes.json().catch(() => null)

      if (me?.user) {
        // si un profil existe déjà -> /profile, sinon -> /profile/edit
        const profRes = await fetch('/api/profile/me', { cache: 'no-store', credentials: 'include' })
        const prof = await profRes.json().catch(() => ({}))
        const dest = redirectTo || (prof?.profile ? '/profile' : '/profile/edit')

        router.replace(dest)
        return
      }
      setMsg("Connecté mais cookie absent. Vérifie que tu es bien sur http://localhost:3000 (pas 127.0.0.1).")
    } else {
      const j = await r.json().catch(() => ({ error: 'Erreur' }))
      setMsg(j.error || 'Identifiants invalides')
    }
    setBusy(false)
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Se connecter</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="emailOrUsername" placeholder="Email ou pseudo" className="input" required />
        <input name="password" type="password" placeholder="Mot de passe" className="input" required />
        <button className="btn" disabled={busy}>{busy ? 'Connexion…' : 'Connexion'}</button>
      </form>
      <p className="mt-3 text-sm">{msg}</p>
    </main>
  )
}
