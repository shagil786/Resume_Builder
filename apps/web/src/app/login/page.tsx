'use client';

import { useState } from 'react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = register
      ? await api.auth.register({ email, password, name })
      : await api.auth.login({ email, password });
    if (result.error || !result.data) setMessage(result.error ?? 'Authentication failed');
    else { window.localStorage.setItem('resume_builder_token', result.data.token); setMessage('Signed in. You can now create or edit your profile.'); }
  }

  return <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
    <h1 className="text-2xl font-bold text-slate-900">{register ? 'Create account' : 'Sign in'}</h1>
    <form onSubmit={submit} className="mt-5 space-y-4">
      {register && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full rounded-lg border px-3 py-2" />}
      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
      <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
      <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white">{register ? 'Register' : 'Sign in'}</button>
    </form>
    {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    <button onClick={() => setRegister(!register)} className="mt-4 text-sm text-slate-500 underline">{register ? 'Already have an account?' : 'Create an account'}</button>
  </div>;
}
