'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';
import { getCurrentProfileId } from '../../lib/profile';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'ready' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [factCount, setFactCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    const validExtension = /\.(pdf|docx)$/i.test(selected.name);
    if (!validExtension) {
      setFile(null); setState('error'); setMessage('Choose a PDF or DOCX file.'); return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null); setState('error'); setMessage('That file is larger than 10MB. Choose a smaller resume.'); return;
    }
    setFile(selected); setState('ready'); setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setState('uploading'); setMessage(null);
    const current = await getCurrentProfileId();
    if (!current.id) { setState('error'); setMessage('Create a profile before uploading your resume.'); }
    else {
      const response = await api.candidates.upload(current.id, file);
      if (response.error) { setState('error'); setMessage(response.error); }
      else { setFactCount(Number(response.data?.factCount ?? 0)); setState('success'); setMessage('Resume uploaded and facts extracted.'); }
    }
  };

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Step 01 · Build your evidence</p><h1 className="page-title">Start with the resume you have.</h1><p className="page-description">We’ll turn your PDF or DOCX into reviewable career facts. Nothing is added to your story without your approval.</p></div></div>

      <div className="surface max-w-3xl p-5 sm:p-8">
        <div
          role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click(); }} onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#b9cbc6] bg-[#f7faf9] p-12 text-center transition-colors hover:border-[#0d6b62] hover:bg-[#f2faf8]">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e3f2ef] text-xl font-bold text-[#0d6b62]">↑</div>
          <p className="mt-4 text-sm font-bold text-[#32433e]">
            {file ? file.name : 'Choose a PDF or DOCX'}
          </p>
          <p className="mt-2 text-xs text-[#64736f]">PDF or DOCX · maximum 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" aria-label="Resume file"
            onChange={e => selectFile(e.target.files?.[0])} />
        </div>

        {state === 'ready' && <p className="mt-3 text-xs font-semibold text-[#64736f]">Ready to extract · {Math.ceil((file?.size ?? 0) / 1024)} KB</p>}
        <button onClick={() => void handleUpload()} disabled={!file || state === 'uploading' || state === 'success'}
          className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50">
          {state === 'uploading' ? 'Uploading and extracting…' : state === 'success' ? 'Extraction complete' : 'Upload & Extract'}
        </button>

        {message && <div role={state === 'error' ? 'alert' : 'status'} className={`${state === 'error' ? 'status-error' : 'status-info'} mt-5 p-4 text-sm`}><p className="font-semibold">{message}</p>{state === 'success' && <><p className="mt-1">{factCount} {factCount === 1 ? 'fact' : 'facts'} are ready for your review.</p><Link href="/facts" className="mt-3 inline-block font-bold text-[#0d6b62] hover:text-[#09564f]">Review extracted facts →</Link></>}</div>}
      </div>
    </div></AuthGuard>
  );
}
