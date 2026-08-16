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
    <AuthGuard><div>
      <h1 className="text-2xl font-bold text-slate-900">Job Description</h1>
      <p className="mt-1 text-sm text-slate-500">Analyze a job posting and generate a tailored resume</p>

      <form onSubmit={handleGenerate} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Company</label>
          <input required value={company} onChange={e => setCompany(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Target title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Job Posting URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://company.com/jobs/..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-400">or paste the description</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Job Description</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
            placeholder="Paste the full job description here..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none resize-y" />
        </div>

        <button type="submit" disabled={generating || !text || !company || !title}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity">
          {generating ? 'Generating...' : 'Generate Resume'}
        </button>

        {result && <p className="text-sm text-slate-600">{result}</p>}
      </form>
    </div></AuthGuard>
  );
}
