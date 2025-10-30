'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProfile() {
  const [me, setMe] = useState(null)
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
  })
  const [avatarUrl, setAvatarUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  // Auth gate
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) router.push('/login')
      else setMe(d.user)
    })
  }, [router])

  // Charger le profil existant
  useEffect(() => {
    fetch('/api/profile/me').then(r => r.json()).then(d => {
      if (!d?.profile) return
      setForm({
        displayName: d.profile.displayName || '',
        bio: d.profile.bio || '',
        location: d.profile.location || '',
        website: d.profile.website || '',
      })
      setAvatarUrl(d.profile.avatarUrl || '')
    })
  }, [])

  async function save(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    const r = await fetch('/api/profile/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setBusy(false)
    if (r.ok) setMsg('Profil enregistré ✅')
    else setMsg((await r.json()).error || 'Erreur')
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // petites vérifs
    const MAX = 5 * 1024 * 1024
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (file.size > MAX) { setMsg('Image > 5MB'); return }
    if (!ALLOWED.includes(file.type)) { setMsg('Format non autorisé'); return }

    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
    if (r.ok) {
      const { profile } = await r.json()
      setAvatarUrl(profile?.avatarUrl || '')
      setMsg('Avatar mis à jour ✅')
    } else {
      setMsg((await r.json()).error || 'Erreur')
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Mon profil</h1>

      {/* Avatar */}
      <div className="card p-4 border mb-6">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || '/placeholder-avatar.png'}
            onError={(e)=>{ e.currentTarget.src='/placeholder-avatar.png' }}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border border-neutral-800"
          />
          <div>
            <div className="text-sm text-neutral-400 mb-1">Changer d’avatar (PNG/JPG/WebP ≤ 5MB)</div>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} />
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={save} className="space-y-3">
        <input
          className="input"
          placeholder="Nom d’affichage"
          value={form.displayName}
          onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
        />
        <textarea
          className="input"
          placeholder="Bio"
          rows={4}
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Localisation"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Site web (https://...)"
          value={form.website}
          onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
        />
        <div className="flex gap-2">
          <button className="btn" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
          <a className="btn" href="/profile">Voir mon profil</a>
        </div>
      </form>

      <p className="mt-3 text-sm">{msg}</p>
    </main>
  )
}
