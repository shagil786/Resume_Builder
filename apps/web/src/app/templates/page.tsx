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
    <div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Presentation</p><h1 className="page-title">Templates that keep the focus on you.</h1><p className="page-description">Choose a clear starting point for your resume. You can change the layout as your application evolves.</p></div></div>

      {loading && <div className="surface p-8 text-sm text-[#64736f]">Loading templates…</div>}
      {error && <p role="alert" className="status-error p-4 text-sm">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)}
            className={`surface p-4 text-left transition-all ${
              selected === t.id
                ? 'border-[#0d6b62] bg-[#f2faf8] ring-2 ring-[#c8ded9]'
                : 'hover:border-[#a9c8c1]'
            }`}>
            <div className="mb-1 flex h-32 items-end gap-1 rounded-md border border-[#e2ebe8] bg-[#f7faf9] p-4">
              <span className="h-16 w-1/4 bg-[#c8ded9]" /><span className="h-24 w-1/3 bg-[#8cbdb5]" /><span className="h-20 flex-1 bg-[#0d6b62]" />
            </div>
            <h3 className="mt-4 font-semibold text-[#17211f]">{t.name}</h3>
            <p className="mt-1 text-sm leading-5 text-[#64736f] line-clamp-2">{t.description}</p>
            <span className="mt-3 inline-block rounded-md bg-[#e3f2ef] px-2 py-1 text-[10px] font-bold tracking-wide text-[#09564f]">
              {t.category}
            </span>
          </button>
        ))}
      </div>

      {!loading && !error && templates.length === 0 && (
        <div className="surface-muted mt-6 p-10 text-center"><p className="font-semibold text-[#32433e]">No templates yet</p><p className="mt-1 text-sm text-[#64736f]">Templates will appear here when the API is available.</p></div>
      )}
    </div>
  );
}
