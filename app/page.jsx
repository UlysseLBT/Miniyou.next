'use client'
import { useEffect, useState } from 'react'

export default function Feed() {
  const [data, setData] = useState({ items: [] })
  const [tag, setTag] = useState('')

  function load(t = ''){
    const q = t ? `?tag=${encodeURIComponent(t)}` : ''
    fetch('/api/media/feed' + q).then(r=>r.json()).then(setData)
  }
  useEffect(() => { load() }, [])

  return (
    <main className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">MiniYou</h1>
        <form onSubmit={e => { e.preventDefault(); load(tag) }} className="flex gap-2">
          <input className="input" placeholder="Filtrer par tag (ex: nature)" value={tag} onChange={e=>setTag(e.target.value)} />
          <button className="btn">Filtrer</button>
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.items.map(m => (
          <a key={m.id} href={`/media/${m.id}`} className="card p-3 border rounded-xl">
            {m.type === 'IMAGE'
              ? <img src={`/${m.path}`} alt={m.title} className="w-full h-48 object-cover rounded-lg" />
              : <video src={`/${m.path}`} className="w-full h-48 rounded-lg" controls/>}
            <div className="mt-2 font-medium">{m.title}</div>
            <div className="text-sm text-neutral-400">@{m.owner.username}</div>
            <div className="text-xs text-neutral-500 mt-1">
              {m.tags?.map(t => t.tag?.name).filter(Boolean).join(' • ')}
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
