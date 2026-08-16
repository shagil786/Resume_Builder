'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function HistoryPage() {
  const [runs, setRuns] = useState<{ id: string; status: string; startedAt: string; completedAt?: string; templateId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) { setLoading(false); return; }
    api.candidates.generations(profileId).then(response => { if (response.data) setRuns(response.data.runs); setLoading(false); });
  }, []);

  return (
    <AuthGuard><div>
      <h1 className="text-2xl font-bold text-slate-900">Version History</h1>
      <p className="mt-1 text-sm text-slate-500">View and compare past resume versions</p>

      {loading ? <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading generation history…</div> : runs.length === 0 ? <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center"><div className="text-4xl">📜</div><p className="mt-3 text-sm text-slate-500">No versions yet. Generate a resume to see history here.</p></div> : <div className="mt-6 space-y-3">{runs.map(run => <Link key={run.id} href="/preview" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300"><div><p className="font-semibold text-slate-900">{run.templateId} resume</p><p className="mt-1 text-xs text-slate-500">{new Date(run.startedAt).toLocaleString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${run.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{run.status}</span></Link>)}</div>}
    </div></AuthGuard>
  );
}
