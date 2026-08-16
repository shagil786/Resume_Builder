'use client';
import { useEffect, useState } from 'react';

interface Template { id: string; name: string; description: string; category: string; }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/candidates/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={h1}>Templates</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {templates.map(t => (
          <div
            key={t.id}
            onClick={() => setSelected(t.id)}
            style={{
              ...card,
              borderColor: selected === t.id ? '#1a1a2e' : '#e0e0e0',
              boxShadow: selected === t.id ? '0 0 0 2px #1a1a2e' : undefined,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{t.description}</div>
            <span style={badge}>{t.category}</span>
          </div>
        ))}
      </div>
      {templates.length === 0 && (
        <p style={{ fontSize: 14, color: '#999' }}>No templates loaded. Make sure the API server is running.</p>
      )}
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const card: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 16, border: '2px solid #e0e0e0', cursor: 'pointer',
};
const badge: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', background: '#f0f0f0', borderRadius: 4,
  fontSize: 11, color: '#666', fontWeight: 600,
};
