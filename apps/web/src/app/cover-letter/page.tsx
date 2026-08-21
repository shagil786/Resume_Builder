'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '../components/auth-guard';

const STORAGE_KEY = 'resume_builder_cover_letter';

export default function CoverLetterPage() {
  const [html, setHtml] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      setHtml(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      setHtml(null);
    }
  }, []);

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cover-letter.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Pair it with your resume</p><h1 className="page-title">Cover letter preview</h1><p className="page-description">A tailored letter built from the same verified facts as your resume. Review it before sending.</p></div></div>

      {!html && (
        <div className="surface p-8 text-center">
          <p className="text-sm text-[#64736f]">No cover letter generated yet.</p>
          <Link href="/job" className="btn btn-primary mt-4 inline-block">Generate one from a job description</Link>
        </div>
      )}

      {html && (
        <div className="mt-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#64736f]">Ready to review · print to save as PDF</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadHtml} className="btn btn-secondary min-h-[38px] text-xs">Download HTML</button>
              <button type="button" onClick={() => previewRef.current?.contentWindow?.print()} className="btn btn-primary min-h-[38px] text-xs">Print</button>
            </div>
          </div>
          <div className="surface overflow-hidden">
            <iframe ref={previewRef} sandbox="" srcDoc={html} className="h-[800px] w-full" title="Cover Letter Preview" />
          </div>
          <p className="mt-3 text-xs text-[#64736f]">
            Generated something new? <Link href="/job" className="underline">Run it again from the job page</Link>.
          </p>
        </div>
      )}
    </div></AuthGuard>
  );
}
