'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const profileId = window.localStorage.getItem('resume_builder_profile_id');
    if (!profileId) setResult('Create a profile first.');
    else {
      const response = await api.candidates.upload(profileId, file);
      setResult(response.error ?? `Uploaded. Extracted ${response.data?.factCount ?? 0} facts.`);
    }
    setUploading(false);
  };

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Step 01 · Build your evidence</p><h1 className="page-title">Start with the resume you have.</h1><p className="page-description">We’ll turn your PDF or DOCX into reviewable career facts. Nothing is added to your story without your approval.</p></div></div>

      <div className="surface max-w-3xl p-5 sm:p-8">
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#b9cbc6] bg-[#f7faf9] p-12 text-center transition-colors hover:border-[#0d6b62] hover:bg-[#f2faf8]">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#e3f2ef] text-xl font-bold text-[#0d6b62]">↑</div>
          <p className="mt-4 text-sm font-bold text-[#32433e]">
            {file ? file.name : 'Click to select a PDF or DOCX'}
          </p>
          <p className="mt-2 text-xs text-[#8b9995]">PDF or DOCX · maximum 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <button onClick={handleUpload} disabled={!file || uploading}
          className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload & Extract'}
        </button>

        {result && <div role="status" className="status-info mt-5 p-4 text-sm"><p>{result}</p><Link href="/facts" className="mt-2 inline-block font-bold text-[#0d6b62] hover:text-[#09564f]">Review extracted facts →</Link></div>}
      </div>
    </div></AuthGuard>
  );
}
