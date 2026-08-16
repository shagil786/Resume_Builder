'use client';
import { useState } from 'react';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setResult('Upload endpoint requires Document Intelligence configuration. Coming soon.');
    setUploading(false);
  };

  return (
    <div>
      <h1 style={h1}>Upload Resume</h1>
      <form onSubmit={handleUpload} style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #e0e0e0' }}>
        <div style={dropzone}>
          <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Drag & drop your resume (PDF or DOCX)</p>
          <p style={{ margin: '8px 0', fontSize: 12, color: '#999' }}>or</p>
          <input type="file" accept=".pdf,.docx" style={{ fontSize: 13 }} />
        </div>
        <button type="submit" disabled={uploading} style={{ ...btn, opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {result && <p style={{ marginTop: 12, fontSize: 14, color: '#333' }}>{result}</p>}
      </form>
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const dropzone: React.CSSProperties = {
  border: '2px dashed #ccc', borderRadius: 8, padding: 40, textAlign: 'center',
  marginBottom: 16, background: '#fafafa',
};
const btn: React.CSSProperties = {
  padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none',
  borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
