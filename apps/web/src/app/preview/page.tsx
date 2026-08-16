'use client';
import { useState } from 'react';

export default function PreviewPage() {
  const [html, setHtml] = useState<string | null>(null);

  const loadPreview = async () => {
    const res = await fetch('/api/v1/candidates/profile-1/render', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    if (res.ok) setHtml(await res.text());
  };

  return (
    <div>
      <h1 style={h1}>Preview</h1>
      <button onClick={loadPreview} style={btn}>Load Preview</button>
      {html && (
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <iframe srcDoc={html} style={{ width: '100%', height: 800, border: 'none' }} title="Resume Preview" />
        </div>
      )}
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const btn: React.CSSProperties = {
  padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none',
  borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
