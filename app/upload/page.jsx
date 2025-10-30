'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED = ['image/jpeg','image/png','image/webp','video/mp4','video/quicktime']

export default function Upload() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)   // { url, type }
  const router = useRouter()

  useEffect(() => {
    fetch('/api/me').then(r=>r.json()).then(d => {
      if (!d.user) router.push('/login')
    })
  }, [router])

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) { setPreview(null); return }
    if (f.size > MAX_SIZE) { setMsg('Fichier trop volumineux (>50MB)'); e.target.value = ''; return }
    if (f.type && !ALLOWED.includes(f.type)) { setMsg('Type de fichier non autorisé'); e.target.value = ''; return }
    const url = URL.createObjectURL(f)
    setPreview({ url, type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'other' })
  }

  async function onSubmit(e){
    e.preventDefault()
    setMsg('')
    setBusy(true)
    const fd = new FormData(e.currentTarget)

    // validations simples
    if (!fd.get('title')) { setMsg('Titre requis'); setBusy(false); return }
    const file = e.currentTarget.file?.files?.[0]
    if (!file) { setMsg('Fichier requis'); setBusy(false); return }
    if (file.size > MAX_SIZE) { setMsg('Fichier trop volumineux (>50MB)'); setBusy(false); return }
    if (file.type && !ALLOWED.includes(file.type)) { setMsg('Type non autorisé'); setBusy(false); return }

    const r = await fetch('/api/media/upload',{ method:'POST', body: fd })
    if (r.ok) {
      setMsg('Upload ok')
      router.push('/')
    } else {
      const j = await r.json().catch(()=>({error:'Erreur'}))
      setMsg(j.error || 'Erreur')
    }
    setBusy(false)
  }

  return (
    <main className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Uploader un média</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input name="title" placeholder="Titre" className="input" />
        <textarea name="description" placeholder="Description" className="input"></textarea>
        <select name="visibility" className="input">
          <option>PUBLIC</option><option>UNLISTED</option><option>PRIVATE</option>
        </select>

        {/* tags optionnels: "nature, tech" ou plusieurs champs tags[]= */}
        <input type="text" name="tags" placeholder="Tags (séparés par des virgules)" className="input" />

        <input type="file" name="file" className="input" accept={ALLOWED.join(',')} onChange={onFileChange} />

        {preview && (
          <div className="card p-3">
            {preview.type === 'image' ? (
              <img src={preview.url} alt="preview" className="w-full rounded-lg" />
            ) : preview.type === 'video' ? (
              <video src={preview.url} className="w-full rounded-lg" controls />
            ) : (
              <div className="text-sm text-neutral-400">Aperçu indisponible</div>
            )}
          </div>
        )}

        <button className="btn" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer'}</button>
      </form>

      <p className="mt-3 text-sm">{msg}</p>
    </main>
  )
}
