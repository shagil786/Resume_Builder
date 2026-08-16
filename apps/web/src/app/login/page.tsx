'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

function LoginForm() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = register
      ? await api.auth.register({ email, password, name })
      : await api.auth.login({ email, password });
    if (result.error || !result.data) setMessage(result.error ?? 'Authentication failed');
    else router.push(searchParams.get('next') || '/dashboard');
    setLoading(false);
  }

  return <div className="page-shell flex min-h-[calc(100vh-72px)] items-center py-10"><div className="surface mx-auto grid w-full max-w-4xl overflow-hidden lg:grid-cols-[.9fr_1.1fr]">
    <div className="bg-[#14231f] p-8 text-white sm:p-10"><p className="eyebrow text-[#8cd1c5]">Your career workspace</p><h1 className="mt-6 text-3xl font-bold tracking-tight">Make your experience easier to see.</h1><p className="mt-4 text-sm leading-7 text-[#c4d2ce]">Keep your source facts organized, tailor each application, and review every suggestion before it becomes part of your resume.</p><div className="mt-10 space-y-4">{['One profile you can keep improving', 'Evidence attached to your achievements', 'A focused resume for every role'].map(item => <div key={item} className="flex gap-3 text-sm text-[#e0ebe8]"><span className="text-[#8cd1c5]">✓</span>{item}</div>)}</div></div>
    <div className="p-8 sm:p-10"><p className="eyebrow">{register ? 'Create your workspace' : 'Welcome back'}</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17211f]">{register ? 'Start with your experience' : 'Sign in to continue'}</h2><form onSubmit={submit} className="mt-7 space-y-5">
      {register && <label className="field-label">Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" className="field-control" /></label>}
      <label className="field-label">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="field-control" /></label>
      <label className="field-label">Password<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="field-control" /></label>
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-50">{loading ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    {message && <p role="alert" className="status-error mt-4 p-3 text-sm">{message}</p>}
    <button onClick={() => { setRegister(!register); setMessage(null); }} className="mt-5 text-sm font-semibold text-[#64736f] underline underline-offset-4">{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></div>
  </div></div>;
}

export default function LoginPage() {
  return <Suspense fallback={<div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-sm text-slate-500">Loading sign in…</div>}><LoginForm /></Suspense>;
}
