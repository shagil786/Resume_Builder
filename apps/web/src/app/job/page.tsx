'use client';
import { useState } from 'react';

export default function JobPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setResult('Generation requires a profile ID and configured AI. Coming soon.');
    setGenerating(false);
  };

  return (
    <div>
      <h1 style={h1}>Job Description</h1>
      <form onSubmit={handleGenerate} style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #e0e0e0' }}>
        <label style={label}>Job Posting URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://company.com/jobs/..." style={input} />

        <label style={label}>Or paste the job description</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder="Paste job description here..." style={{ ...input, resize: 'vertical' as const }} />

        <button type="submit" disabled={generating || (!url && !text)} style={{ ...btn, opacity: generating || (!url && !text) ? 0.6 : 1 }}>
          {generating ? 'Generating...' : 'Generate Resume'}
        </button>
        {result && <p style={{ marginTop: 12, fontSize: 14, color: '#333' }}>{result}</p>}
      </form>
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 4px 12px' };
const input: React.CSSProperties = {
  width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6,
  fontSize: 14, marginBottom: 16, boxSizing: 'border-box',
};
const btn: React.CSSProperties = {
  padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none',
  borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
