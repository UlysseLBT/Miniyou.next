'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setMsg(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const email = String(data.email || '').trim().toLowerCase();
    const username = String(data.username || '').trim();
    const password = String(data.password || '');

    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, username, password }),
      });

      if (r.ok) {
        // ✅ redirection immédiate vers /login
        router.replace('/login?created=1');
        return; // ne pas continuer
      } else {
        const j = await r.json().catch(() => ({}));
        if (r.status === 409) {
          if (typeof j?.error === 'string' && j.error.includes('email')) setMsg('Cet email est déjà utilisé.');
          else if (typeof j?.error === 'string' && j.error.includes('username')) setMsg('Ce pseudo est déjà pris.');
          else setMsg('Email ou pseudo déjà pris.');
        } else if (r.status === 400) {
          setMsg('Données invalides.');
        } else {
          setMsg('Erreur serveur. Réessaie.');
        }
      }
    } catch (err) {
      setMsg('Impossible de contacter le serveur.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Déjà un compte ? <Link className="underline" href="/login">Se connecter</Link>
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" type="email" placeholder="Email" className="input w-full" required autoComplete="email" />
        <input name="username" placeholder="Pseudo" className="input w-full" required autoComplete="username" />
        <input name="password" type="password" placeholder="Mot de passe (8+)" className="input w-full" required minLength={8} autoComplete="new-password" />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? 'Création…' : "S'inscrire"}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
    </main>
  );
}
