'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileUp, Loader2, UploadCloud } from 'lucide-react';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';
import { getCurrentProfileId } from '../../lib/profile';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
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
          onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={event => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center transition-colors ${dragging ? 'border-accent bg-accent-soft' : 'border-[#b9cbc6] bg-[#f7faf9] hover:border-accent hover:bg-accent-soft'}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-soft text-accent">
            {state === 'uploading' ? <Loader2 aria-hidden className="animate-spin" size={22} /> : <UploadCloud aria-hidden size={22} />}
          </div>
          <p className="mt-4 text-sm font-bold text-label">
            {file ? file.name : dragging ? 'Drop your resume here' : 'Choose a PDF or DOCX'}
          </p>
          <p className="mt-2 text-xs text-muted">Drag & drop or click to browse · PDF or DOCX · maximum 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" aria-label="Resume file"
            onChange={e => selectFile(e.target.files?.[0])} />
        </div>

        {state === 'ready' && <p className="mt-3 text-xs font-semibold text-muted">Ready to extract · {Math.ceil((file?.size ?? 0) / 1024)} KB</p>}
        <button onClick={() => void handleUpload()} disabled={!file || state === 'uploading' || state === 'success'}
          className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50">
          {state === 'uploading' ? <>Uploading and extracting…</> : state === 'success' ? <><CheckCircle2 aria-hidden size={16} /> Extraction complete</> : <><FileUp aria-hidden size={16} /> Upload & Extract</>}
        </button>

        {message && <div role={state === 'error' ? 'alert' : 'status'} className={`${state === 'error' ? 'status-error' : 'status-info'} mt-5 text-sm`}><p className="font-semibold">{message}</p>{state === 'success' && <><p className="mt-1">{factCount} {factCount === 1 ? 'fact' : 'facts'} are ready for your review.</p><Link href="/facts" className="mt-3 inline-flex items-center gap-1 font-bold text-accent hover:text-accent-strong">Review extracted facts <ArrowRight aria-hidden size={14} /></Link></>}</div>}
      </div>
    </div></AuthGuard>
  );
}
