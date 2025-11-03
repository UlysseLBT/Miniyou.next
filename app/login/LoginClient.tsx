// app/login/LoginClient.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [msg, setMsg] = useState<string | null>(
    params.get('created') ? 'Compte créé, tu peux te connecter.' : null
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const emailOrUsername = String(data.emailOrUsername || '').trim();
    const password = String(data.password || '');

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (r.ok) {
        // vérifie que le cookie est bien présent puis redirige
        const meRes = await fetch('/api/me', { cache: 'no-store', credentials: 'include' });
        if (meRes.ok) {
          router.replace('/profile'); // ou /profile/edit selon ta logique
          return;
        }
      }

      const j = await r.json().catch(() => ({}));
      setMsg(j?.error || 'Identifiants invalides');
    } catch {
      setMsg('Impossible de contacter le serveur.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Se connecter</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="emailOrUsername"
          placeholder="Email ou pseudo"
          className="input w-full"
          required
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          className="input w-full"
          required
          autoComplete="current-password"
        />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? 'Connexion…' : 'Connexion'}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </main>
  );
}
