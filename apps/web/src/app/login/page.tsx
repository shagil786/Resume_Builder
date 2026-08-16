'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = register
      ? await api.auth.register({ email, password, name })
      : await api.auth.login({ email, password });
    if (result.error || !result.data) setMessage(result.error ?? 'Authentication failed');
    else { window.localStorage.setItem('resume_builder_token', result.data.token); router.push('/dashboard'); }
    setLoading(false);
  }

  return <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
    <div className="bg-slate-950 p-8 text-white sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">Your career workspace</p><h1 className="mt-6 text-3xl font-bold tracking-tight">Make your experience easier to see.</h1><p className="mt-4 text-sm leading-7 text-slate-300">Keep your source facts organized, tailor each application, and review every AI suggestion before it becomes part of your resume.</p><div className="mt-10 space-y-4">{['One profile you can keep improving', 'Evidence attached to your achievements', 'A focused resume for every role'].map(item => <div key={item} className="flex gap-3 text-sm text-slate-200"><span className="text-teal-300">✓</span>{item}</div>)}</div></div>
    <div className="p-8 sm:p-10"><p className="text-sm font-semibold text-teal-700">{register ? 'Create your workspace' : 'Welcome back'}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{register ? 'Start with your experience' : 'Sign in to continue'}</h2><form onSubmit={submit} className="mt-7 space-y-4">
      {register && <label className="block text-sm font-medium text-slate-700">Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>}
      <label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      <label className="block text-sm font-medium text-slate-700">Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      <button disabled={loading} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">{loading ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    {message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    <button onClick={() => { setRegister(!register); setMessage(null); }} className="mt-5 text-sm font-medium text-slate-500 underline underline-offset-4">{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></div>
  </div>;
}
