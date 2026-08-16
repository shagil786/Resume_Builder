'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function PreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState('');

  useEffect(() => setProfileId(window.localStorage.getItem('resume_builder_profile_id') ?? ''), []);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const runId = window.localStorage.getItem('resume_builder_generation_id');
      if (runId) {
        const generatedHtml = await api.candidates.generationPreview(profileId, runId);
        if (generatedHtml) { setHtml(generatedHtml); return; }
      }
      const rendered = await api.render(profileId);
      if (rendered) setHtml(rendered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Review before you send</p><h1 className="page-title">Resume preview</h1><p className="page-description">Read the rendered version as a recruiter would. Go back and adjust your facts or target role whenever something feels off.</p></div></div>

      <div className="surface flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center">
        <input value={profileId} onChange={e => setProfileId(e.target.value)}
          placeholder="Profile ID" className="field-control mt-0 sm:max-w-xs" />
        <button onClick={loadPreview} disabled={loading}
          className="btn btn-primary disabled:opacity-50">
          {loading ? 'Loading...' : 'Load Preview'}
        </button>
      </div>

      {html && (
        <div className="surface mt-6 overflow-hidden">
          <iframe sandbox="" srcDoc={html} className="h-[800px] w-full" title="Resume Preview" />
        </div>
      )}
    </div></AuthGuard>
  );
}
