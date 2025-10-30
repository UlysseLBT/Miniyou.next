'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [items, setItems] = useState([])
  const [me, setMe] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/me').then(r=>r.json()).then(d => {
      if (!d.user) router.push('/login'); else setMe(d.user)
    })
  }, [router])

  useEffect(() => { fetch('/api/media/mine').then(r=>r.json()).then(d=>setItems(d.items||[])) }, [])

  async function del(id) {
    if (!confirm('Supprimer ce média ?')) return
    const r = await fetch(`/api/media/${id}`, { method:'DELETE' })
    if (r.ok) setItems(x => x.filter(i => i.id !== id))
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mes médias {me ? `(@${me.username})` : ''}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(m => (
          <div key={m.id} className="card p-3 border rounded-xl">
            {m.type === 'IMAGE'
              ? <img src={`/${m.path}`} alt={m.title} className="w-full h-40 object-cover rounded-lg" />
              : <video src={`/${m.path}`} className="w-full h-40 rounded-lg" controls/>}
            <div className="mt-2 font-medium">{m.title}</div>
            <div className="flex gap-2 mt-2">
              <a className="btn" href={`/media/${m.id}`}>Voir</a>
              <button className="btn" onClick={() => del(m.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
