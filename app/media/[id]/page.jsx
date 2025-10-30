'use client'
import { useEffect, useState } from 'react'

export default function MediaPage({ params }) {
  const [m, setM] = useState(null)
  const [liked, setLiked] = useState(false)

  async function load() {
    const r = await fetch(`/api/media/${params.id}`)
    setM(await r.json())
  }
  useEffect(() => { load() }, [params.id])

  async function like()   { const r = await fetch(`/api/media/${params.id}/like`, { method:'POST' });  if (r.ok){ setLiked(true);  load() } }
  async function unlike() { const r = await fetch(`/api/media/${params.id}/like`, { method:'DELETE'}); if (r.ok){ setLiked(false); load() } }

  if (!m) return <main className="p-6">Chargement…</main>
  return (
    <main className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">{m.title}</h1>
      {m.type === 'IMAGE'
        ? <img src={`/${m.path}`} alt={m.title} className="w-full rounded-xl" />
        : <video src={`/${m.path}`} className="w-full rounded-xl" controls />}
      <div className="mt-3 text-sm text-neutral-400 flex items-center gap-3">
        <span>par @{m.owner.username}</span>
        <span>• 👍 {m._count?.likes ?? m.likes}</span>
        {!liked ? <button className="btn" onClick={like}>Like</button> : <button className="btn" onClick={unlike}>Unlike</button>}
      </div>
      <p className="mt-4">{m.description}</p>

      <Comments mediaId={m.id} initial={m.comments || []} />
    </main>
  )
}

function Comments({ mediaId, initial }) {
  const [list, setList] = useState(initial)
  const [content, setContent] = useState('')

  async function submit(e){
    e.preventDefault()
    if (!content.trim()) return
    const r = await fetch(`/api/media/${mediaId}/comment`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content })
    })
    if (r.ok) { const c = await r.json(); setList([c, ...list]); setContent('') }
  }
  return (
    <section className="mt-6">
      <h2 className="font-semibold mb-2">Commentaires</h2>
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input className="input" value={content} onChange={e=>setContent(e.target.value)} placeholder="Écrire un commentaire…" />
        <button className="btn">Envoyer</button>
      </form>
      <div className="space-y-2">
        {list.map(c => (
          <div key={c.id} className="border rounded-xl p-3">
            <div className="text-sm text-neutral-400">@{c.author?.username ?? 'user'}</div>
            <div>{c.content}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
