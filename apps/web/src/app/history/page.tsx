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
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Your work</p><h1 className="page-title">Version history</h1><p className="page-description">Return to an earlier tailored resume or compare how your applications have evolved.</p></div></div>

      {loading ? <div className="surface p-8 text-sm text-[#64736f]">Loading generation history…</div> : runs.length === 0 ? <div className="surface-muted p-12 text-center"><div className="text-2xl font-bold text-[#0d6b62]">—</div><p className="mt-3 font-semibold text-[#32433e]">No versions yet</p><p className="mt-1 text-sm text-[#64736f]">Generate a resume to see your application history here.</p></div> : <div className="space-y-3">{runs.map(run => <Link key={run.id} href="/preview" className="surface flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#a9c8c1]"><div><p className="font-semibold text-[#17211f]">{run.templateId} resume</p><p className="mt-1 text-xs text-[#64736f]">{new Date(run.startedAt).toLocaleString()}</p></div><span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${run.status === 'COMPLETED' ? 'bg-[#e3f2ef] text-[#087443]' : 'bg-[#eef3f1] text-[#64736f]'}`}>{run.status}</span></Link>)}</div>}
    </div></AuthGuard>
  );
}
