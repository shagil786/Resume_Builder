'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';
import { getCurrentProfileId } from '../../lib/profile';

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
    setLoading(true); setError(null);
    const current = await getCurrentProfileId();
    if (!current.id) {
      setError('Create a profile before reviewing facts.');
      setLoading(false);
      return;
    }
    const response = await api.candidates.searchFacts(current.id, '');
    if (response.data) setFacts(response.data.facts as Fact[]);
    else setError(response.error ?? 'Unable to load extracted facts');
    setLoading(false);
  }, []);

  useEffect(() => { void loadFacts(); }, [loadFacts]);

  async function updateFact(factId: string, status: Fact['status']) {
    const current = await getCurrentProfileId();
    if (!current.id) return;
    const response = await api.candidates.updateFactStatus(current.id, factId, status);
    if (response.error) setError(response.error);
    else {
      setFacts(current => current.map(fact => fact.id === factId ? { ...fact, status } : fact));
      setMessage('Fact status updated.');
    }
  }

  return <AuthGuard><div className="page-shell space-y-8">
    <div className="page-header"><div><p className="eyebrow">Evidence review</p><h1 className="page-title">Your extracted facts</h1><p className="page-description">Review every claim before it can influence a tailored resume. Verified facts are the safe foundation for generation.</p></div></div>
    {message && <p role="status" className="status-success p-3 text-sm">{message}</p>}
    {error && <div role="alert" className="status-error flex flex-col justify-between gap-3 p-3 text-sm sm:flex-row sm:items-center"><span>{error}</span><button type="button" onClick={() => void loadFacts()} className="btn btn-secondary min-h-[34px] px-3 text-xs">Try again</button></div>}
    {!loading && facts.length > 0 && <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#64736f]"><span className="rounded-md bg-[#eef3f1] px-2.5 py-1.5">{facts.length} total</span><span className="rounded-md bg-[#e3f2ef] px-2.5 py-1.5 text-[#087443]">{facts.filter(fact => fact.status === 'VERIFIED').length} verified</span><span className="rounded-md bg-[#fff7e8] px-2.5 py-1.5 text-[#9a6700]">{facts.filter(fact => fact.status === 'EXTRACTED' || fact.status === 'NEEDS_REVIEW').length} to review</span></div>}
    {loading ? <div className="surface p-8 text-sm text-[#64736f]">Loading facts…</div> : facts.length === 0 ? <div className="surface-muted p-12 text-center"><p className="text-2xl font-bold text-[#0d6b62]">◎</p><h2 className="mt-3 font-semibold text-[#32433e]">No facts yet</h2><p className="mt-1 text-sm text-[#64736f]">Upload a resume to extract evidence for review.</p></div> : <div className="space-y-4">{facts.map(fact => <article key={fact.id} className="surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-[#e3f2ef] px-2.5 py-1 text-[11px] font-bold text-[#09564f]">{fact.category}</span><span className="text-xs text-[#64736f]">{Math.round(fact.confidence * 100)}% confidence · {fact.sourceRef}</span></div><h2 className="mt-3 text-base font-semibold leading-6 text-[#17211f]">{fact.claim}</h2>{fact.context && <p className="mt-2 text-sm leading-6 text-[#64736f]">{fact.context}</p>}</div><select aria-label={`Status for ${fact.claim}`} value={fact.status === 'EXTRACTED' ? 'NEEDS_REVIEW' : fact.status} onChange={event => void updateFact(fact.id, event.target.value as Fact['status'])} className="field-control mt-0 w-full sm:w-auto"><option value="NEEDS_REVIEW">Needs review</option><option value="VERIFIED">Verified</option><option value="REJECTED">Rejected</option></select></div></article>)}</div>}
  </div></AuthGuard>;
}
