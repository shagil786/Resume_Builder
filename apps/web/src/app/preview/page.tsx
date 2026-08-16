'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function PreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState('profile-1');

  const loadPreview = async () => {
    setLoading(true);
    try {
      const rendered = await api.render(profileId);
      if (rendered) setHtml(rendered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard><div>
      <h1 className="text-2xl font-bold text-slate-900">Preview</h1>
      <p className="mt-1 text-sm text-slate-500">Preview your resume as rendered HTML</p>

      <div className="mt-6 flex items-center gap-3">
        <input value={profileId} onChange={e => setProfileId(e.target.value)}
          placeholder="Profile ID" className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none w-64" />
        <button onClick={loadPreview} disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity">
          {loading ? 'Loading...' : 'Load Preview'}
        </button>
      </div>

      {html && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <iframe sandbox="" srcDoc={html} className="h-[800px] w-full" title="Resume Preview" />
        </div>
      )}
    </div></AuthGuard>
  );
}
