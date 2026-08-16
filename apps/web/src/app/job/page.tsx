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
  const [notice, setNotice] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (text.trim().length < 40) {
      setNotice({ type: 'error', text: 'Paste the full job description so we can make a useful match (at least 40 characters).' });
      return;
    }
    setGenerating(true);
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) {
      setNotice({ type: 'error', text: 'Create a profile before generating a tailored resume.' });
      setGenerating(false);
      return;
    }
    try {
      const response = await api.candidates.generate(profileId, { jobDescription: text.trim(), company: company.trim(), title: title.trim() });
      if (response.error) setNotice({ type: 'error', text: response.error });
      else {
        const runId = (response.data as { run?: { id?: string } } | undefined)?.run?.id;
        if (runId) {
          window.localStorage.setItem('resume_builder_generation_id', runId);
          router.push(`/preview?runId=${encodeURIComponent(runId)}`);
        } else setNotice({ type: 'error', text: 'Generation finished, but no preview was returned. Please try again.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'We could not generate this resume. Check your connection and try again.' });
    } finally {
      setGenerating(false);
    }
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
          <label className="field-label">Job posting URL <span className="font-normal text-[#8b9995]">(optional reference)</span></label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://company.com/jobs/..."
            className="field-control" />
          <p className="field-help">We don’t fetch URLs yet. Paste the job description below so it can be analyzed.</p>
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
          <label htmlFor="job-description" className="field-label">Job description <span className="text-[#b42318]">*</span></label>
          <textarea id="job-description" value={text} onChange={e => setText(e.target.value)} rows={8}
            placeholder="Paste the full job description here..."
            required minLength={40} className="field-control min-h-44 resize-y" />
          <div className="mt-2 flex justify-between gap-3 text-xs text-[#8b9995]"><span>Include responsibilities and requirements for a stronger match.</span><span>{text.length} characters</span></div>
        </div>

        <button type="submit" disabled={generating}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
          {generating ? 'Matching facts and drafting…' : 'Generate tailored resume'}
        </button>

        {notice && <p role={notice.type === 'error' ? 'alert' : 'status'} className={`${notice.type === 'error' ? 'status-error' : 'status-info'} p-3 text-sm`}>{notice.text}</p>}
      </form>
    </div></AuthGuard>
  );
}
