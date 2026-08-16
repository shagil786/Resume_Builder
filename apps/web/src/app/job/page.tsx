'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function JobPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) setResult('Create a profile first.');
    else {
      const response = await api.candidates.generate(profileId, { jobDescription: text, company, title });
      if (response.error) setResult(response.error);
      else {
        const runId = (response.data as { run?: { id?: string } } | undefined)?.run?.id;
        if (runId) {
          window.localStorage.setItem('resume_builder_generation_id', runId);
          router.push('/preview');
        } else setResult('Generation completed, but no preview was returned.');
      }
    }
    setGenerating(false);
  };

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Step 03 · Tailor your application</p><h1 className="page-title">Aim your resume at the role.</h1><p className="page-description">Share the job you want. We’ll match it against your reviewed facts and create a focused draft for you to inspect.</p></div></div>

      <form onSubmit={handleGenerate} className="surface max-w-3xl space-y-5 p-5 sm:p-8">
        <div>
          <label className="field-label">Company<input required value={company} onChange={e => setCompany(e.target.value)} className="field-control" /></label>
        </div>
        <div>
          <label className="field-label">Target title<input required value={title} onChange={e => setTitle(e.target.value)} className="field-control" /></label>
        </div>
        <div>
          <label className="field-label">Job posting URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://company.com/jobs/..."
            className="field-control" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-xs font-semibold uppercase tracking-[.12em] text-[#8b9995]">or paste the description</span>
          </div>
        </div>

        <div>
          <label className="field-label">Job description</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
            placeholder="Paste the full job description here..."
            className="field-control min-h-44 resize-y" />
        </div>

        <button type="submit" disabled={generating || !text || !company || !title}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate Resume'}
        </button>

        {result && <p role="status" className="status-info p-3 text-sm">{result}</p>}
      </form>
    </div></AuthGuard>
  );
}
