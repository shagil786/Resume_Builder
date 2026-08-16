'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function PreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [runId, setRunId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfileId(window.localStorage.getItem('resume_builder_profile_id') ?? '');
    setRunId(new URLSearchParams(window.location.search).get('runId') ?? window.localStorage.getItem('resume_builder_generation_id') ?? '');
  }, []);

  const loadPreview = async (requestedRunId = runId) => {
    setLoading(true);
    setError(null);
    setHtml(null);
    try {
      if (requestedRunId) {
        const generatedHtml = await api.candidates.generationPreview(profileId, requestedRunId);
        if (generatedHtml) { setHtml(generatedHtml); return; }
        setError('That resume version is unavailable. It may still be generating or may have been removed.');
        return;
      }
      const rendered = await api.render(profileId);
      if (rendered) setHtml(rendered);
      else setError('We could not render this resume yet.');
    } catch {
      setError('We could not load this preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId && runId) void loadPreview(runId);
  }, [profileId, runId]);

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Review before you send</p><h1 className="page-title">Resume preview</h1><p className="page-description">Read the rendered version as a recruiter would. Go back and adjust your facts or target role whenever something feels off.</p></div></div>

      <div className="surface flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center">
        <input value={profileId} onChange={e => setProfileId(e.target.value)}
          placeholder="Profile ID" className="field-control mt-0 sm:max-w-xs" />
        <button onClick={() => void loadPreview()} disabled={loading}
          className="btn btn-primary disabled:opacity-50">
          {loading ? 'Loading...' : 'Load Preview'}
        </button>
      </div>

      {error && <p role="alert" className="status-error mt-4 p-3 text-sm">{error}</p>}

      {html && (
        <div className="surface mt-6 overflow-hidden">
          <iframe sandbox="" srcDoc={html} className="h-[800px] w-full" title="Resume Preview" />
        </div>
      )}
    </div></AuthGuard>
  );
}
