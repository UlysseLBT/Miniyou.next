'use client'
import { useState } from 'react'

export default function Register() {
  const [msg, setMsg] = useState('')
  async function onSubmit(e){
    e.preventDefault()
    const body = Object.fromEntries(new FormData(e.currentTarget))
    const r = await fetch('/api/auth/register', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    setMsg(r.ok ? 'Compte créé, connecte-toi.' : (await r.json()).error || 'Erreur')
  }
  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" placeholder="Email" className="input" required />
        <input name="username" placeholder="Nom d’utilisateur" className="input" required />
        <input name="password" type="password" placeholder="Mot de passe (≥ 8 caractères)" className="input" required />
        <button className="btn">S’inscrire</button>
      </form>
      <p className="mt-3 text-sm">{msg}</p>
    </main>
  )
}

