'use client';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';
import { getCurrentProfileId } from '../../lib/profile';

export default function PreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [runId, setRunId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    getCurrentProfileId().then(current => setProfileId(current.id ?? ''));
    setRunId(new URLSearchParams(window.location.search).get('runId') ?? '');
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

  const printPreview = () => previewRef.current?.contentWindow?.print();

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-${runId || 'draft'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!profileId || !runId) { setError('Generate or select a resume version before downloading a PDF.'); return; }
    setExporting(true); setError(null);
    try {
      const blob = await api.candidates.generationPreviewPdf(profileId, runId);
      if (!blob) { setError('We could not create the PDF. Please try again.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${runId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { setError('We could not create the PDF. Please try again.'); }
    finally { setExporting(false); }
  };

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
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#64736f]">Ready to review · print to save a PDF</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadHtml} className="btn btn-secondary min-h-[38px] text-xs">Download HTML</button>
              <button type="button" onClick={() => void downloadPdf()} disabled={exporting} className="btn btn-primary min-h-[38px] text-xs disabled:opacity-50">{exporting ? 'Creating PDF…' : 'Download PDF'}</button>
              <button type="button" onClick={printPreview} className="btn btn-secondary min-h-[38px] text-xs">Print</button>
            </div>
          </div>
          <div className="surface overflow-hidden">
            <iframe ref={previewRef} sandbox="" srcDoc={html} className="h-[800px] w-full" title="Resume Preview" />
          </div>
        </div>
      )}
    </div></AuthGuard>
  );
}
