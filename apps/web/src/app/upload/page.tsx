'use client';
import { useState, useRef } from 'react';
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
    <AuthGuard><div>
      <h1 className="text-2xl font-bold text-slate-900">Upload Resume</h1>
      <p className="mt-1 text-sm text-slate-500">Upload a PDF or DOCX to extract career facts</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 transition-colors hover:border-slate-400">
          <div className="text-4xl">📄</div>
          <p className="mt-3 text-sm font-medium text-slate-700">
            {file ? file.name : 'Click to select a PDF or DOCX'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Max 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <button onClick={handleUpload} disabled={!file || uploading}
          className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity">
          {uploading ? 'Uploading...' : 'Upload & Extract'}
        </button>

        {result && <p className="mt-3 text-sm text-slate-600">{result}</p>}
      </div>
    </div></AuthGuard>
  );
}
