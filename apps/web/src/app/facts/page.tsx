'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

type Fact = {
  id: string;
  claim: string;
  context: string;
  category: string;
  confidence: number;
  status: 'EXTRACTED' | 'USER_PROVIDED' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  sourceRef: string;
  verificationNotes?: string;
};

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFacts = useCallback(async () => {
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) {
      setError('Create a profile before reviewing facts.');
      setLoading(false);
      return;
    }
    const response = await api.candidates.searchFacts(profileId, '');
    if (response.data) setFacts(response.data.facts as Fact[]);
    else setError(response.error ?? 'Unable to load extracted facts');
    setLoading(false);
  }, []);

  useEffect(() => { void loadFacts(); }, [loadFacts]);

  async function updateFact(factId: string, status: Fact['status']) {
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) return;
    const response = await api.candidates.updateFactStatus(profileId, factId, status);
    if (response.error) setError(response.error);
    else {
      setFacts(current => current.map(fact => fact.id === factId ? { ...fact, status } : fact));
      setMessage('Fact status updated.');
    }
  }

  return <AuthGuard><div className="space-y-8">
    <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Evidence review</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your extracted facts</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review every claim before it can influence a tailored resume. Verified facts are the safe foundation for generation.</p></div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading facts…</div> : facts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="text-4xl">◎</p><h2 className="mt-3 font-semibold text-slate-900">No facts yet</h2><p className="mt-1 text-sm text-slate-500">Upload a resume to extract evidence for review.</p></div> : <div className="space-y-4">{facts.map(fact => <article key={fact.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{fact.category}</span><span className="text-xs text-slate-400">{Math.round(fact.confidence * 100)}% confidence · {fact.sourceRef}</span></div><h2 className="mt-3 text-base font-semibold leading-6 text-slate-950">{fact.claim}</h2>{fact.context && <p className="mt-2 text-sm leading-6 text-slate-500">{fact.context}</p>}</div><select aria-label={`Status for ${fact.claim}`} value={fact.status === 'EXTRACTED' ? 'NEEDS_REVIEW' : fact.status} onChange={event => void updateFact(fact.id, event.target.value as Fact['status'])} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"><option value="NEEDS_REVIEW">Needs review</option><option value="VERIFIED">Verified</option><option value="REJECTED">Rejected</option></select></div></article>)}</div>}
  </div></AuthGuard>;
}
