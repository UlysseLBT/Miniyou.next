'use client';

import { useState } from 'react';
import Link from 'next/link';

type ApiError =
  | { error: string }
  | { error: 'Invalid payload'; issues?: any }
  | { error: 'Duplicate email or username' }
  | { error: `Duplicate email` }
  | { error: `Duplicate username` };

export default function RegisterPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setOk(false);
    setMsg(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    // validation minimaliste côté client (facultatif)
    const email = String(data.email || '').trim().toLowerCase();
    const username = String(data.username || '').trim();
    const password = String(data.password || '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Email invalide');
      setBusy(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      setMsg('Le pseudo doit faire 3–30 caractères (a-z, A-Z, 0-9, _).');
      setBusy(false);
      return;
    }
    if (password.length < 8) {
      setMsg('Mot de passe trop court (min. 8).');
      setBusy(false);
      return;
    }

    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password }),
    });

    if (r.ok) {
      setOk(true);
      setMsg('Compte créé ! Tu peux te connecter.');
      (e.currentTarget as HTMLFormElement).reset();
    } else {
      const j = (await r.json().catch(() => ({}))) as ApiError;
      // messages un peu plus précis
      if (r.status === 409) {
        if ('error' in j && typeof j.error === 'string') {
          if (j.error.includes('email')) setMsg("Cet email est déjà utilisé.");
          else if (j.error.includes('username')) setMsg("Ce pseudo est déjà pris.");
          else setMsg("Email ou pseudo déjà pris.");
        } else {
          setMsg('Email ou pseudo déjà pris.');
        }
      } else if (r.status === 400) {
        setMsg('Données invalides.');
      } else {
        setMsg('Erreur serveur. Réessaie.');
      }
    }

    setBusy(false);
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Tu as déjà un compte ?{' '}
        <Link href="/login" className="underline">
          Connecte-toi
        </Link>
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input w-full"
            required
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="sr-only">Pseudo</span>
          <input
            name="username"
            placeholder="Pseudo"
            className="input w-full"
            required
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="sr-only">Mot de passe</span>
          <input
            name="password"
            type="password"
            placeholder="Mot de passe (8+)"
            className="input w-full"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </label>

        <button className="btn w-full" disabled={busy}>
          {busy ? 'Création…' : 'Créer le compte'}
        </button>
      </form>

      {msg && (
        <p className={`mt-3 text-sm ${ok ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
    </main>
  );
}
