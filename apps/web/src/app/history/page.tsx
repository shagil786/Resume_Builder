'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';
import { getCurrentProfileId } from '../../lib/profile';

export default function HistoryPage() {
  const [runs, setRuns] = useState<{ id: string; status: string; startedAt: string; completedAt?: string; templateId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true); setError(null);
    const current = await getCurrentProfileId();
    if (!current.id) { setLoading(false); return; }
    try {
      const response = await api.candidates.generations(current.id);
      if (response.data) setRuns(response.data.runs);
      else setError(response.error ?? 'Unable to load generation history');
    } catch { setError('We could not reach generation history.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Your work</p><h1 className="page-title">Version history</h1><p className="page-description">Return to an earlier tailored resume or compare how your applications have evolved.</p></div></div>

      {error && <div role="alert" className="status-error flex flex-col justify-between gap-3 p-4 text-sm sm:flex-row sm:items-center"><span>{error}</span><button type="button" onClick={() => void loadHistory()} className="btn btn-secondary min-h-[34px] px-3 text-xs">Try again</button></div>}
      {!error && (loading ? <div className="surface p-8 text-sm text-[#64736f]">Loading generation history…</div> : runs.length === 0 ? <div className="surface-muted p-12 text-center"><div className="text-2xl font-bold text-[#0d6b62]">—</div><p className="mt-3 font-semibold text-[#32433e]">No versions yet</p><p className="mt-1 text-sm text-[#64736f]">Generate a resume to see your application history here.</p></div> : <div className="space-y-3">{runs.map(run => <Link key={run.id} href={`/preview?runId=${encodeURIComponent(run.id)}`} className="surface flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#a9c8c1]"><div><p className="font-semibold text-[#17211f]">{run.templateId} resume</p><p className="mt-1 text-xs text-[#64736f]">{new Date(run.startedAt).toLocaleString()}</p></div><span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${run.status === 'COMPLETED' ? 'bg-[#e3f2ef] text-[#087443]' : 'bg-[#eef3f1] text-[#64736f]'}`}>{run.status}</span></Link>)}</div>)}
    </div></AuthGuard>
  );
}
