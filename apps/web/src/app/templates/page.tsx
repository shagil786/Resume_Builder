'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Template { id: string; name: string; description: string; category: string; }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.templates.list().then(response => {
      if (!active) return;
      if (response.data) setTemplates(response.data.templates);
      else setError(response.error ?? 'Unable to load templates');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a layout for your resume</p>

      {loading && <p className="mt-8 text-center text-sm text-slate-400">Loading templates...</p>}
      {error && <p className="mt-8 text-center text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              selected === t.id
                ? 'border-slate-900 bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}>
            <div className="mb-1 h-32 rounded-lg bg-slate-100 flex items-center justify-center text-4xl">
              {t.category === 'PROFESSIONAL' ? '📋' : t.category === 'ACADEMIC' ? '🎓' : '✨'}
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">{t.name}</h3>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{t.description}</p>
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {t.category}
            </span>
          </button>
        ))}
      </div>

      {!loading && !error && templates.length === 0 && (
        <p className="mt-8 text-sm text-slate-400 text-center">No templates loaded. Make sure the API server is running.</p>
      )}
    </div>
  );
}
