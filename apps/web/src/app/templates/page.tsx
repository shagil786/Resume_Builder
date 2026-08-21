'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { LayoutTemplate } from 'lucide-react';
import { api } from '../../lib/api';
import { getSelectedTemplateId, setSelectedTemplateId } from '../../lib/template';
import { Skeleton } from '../components/skeleton';

interface Template { id: string; name: string; description: string; category: string; }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await api.templates.list();
      if (response.data) setTemplates(response.data.templates);
      else setError(response.error ?? 'Unable to load templates');
    } catch {
      setError('We could not reach the template service.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadTemplates();
    setSelected(getSelectedTemplateId());
  }, [loadTemplates]);

  const chooseTemplate = (id: string) => {
    setSelected(id);
    setSelectedTemplateId(id);
    toast.success('Saved — your next generated resume will use this layout.');
  };

  return (
    <div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Presentation</p><h1 className="page-title">Templates that keep the focus on you.</h1><p className="page-description">Choose a clear starting point for your resume. Your selection applies to the next resume you generate. You can change the layout as your application evolves.</p></div></div>

      {loading && <div className="surface grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <Skeleton key={i} className="h-64 w-full" />)}</div>}
      {error && <div role="alert" className="status-error flex flex-col justify-between gap-3 text-sm sm:flex-row sm:items-center"><span>{error}</span><button type="button" onClick={() => void loadTemplates()} className="btn btn-secondary min-h-[34px] px-3 text-xs">Try again</button></div>}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, index) => (
          <motion.button key={t.id} onClick={() => chooseTemplate(t.id)}
            aria-pressed={selected === t.id}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
            className={`surface p-4 text-left transition-all ${
              selected === t.id
                ? 'border-[#0d6b62] bg-[#f2faf8] ring-2 ring-[#c8ded9]'
                : 'hover:border-[#a9c8c1]'
            }`}>
            <div className="mb-1 flex h-32 items-end gap-1 rounded-md border border-[#e2ebe8] bg-[#f7faf9] p-4">
              <span className="h-16 w-1/4 bg-[#c8ded9]" /><span className="h-24 w-1/3 bg-[#8cbdb5]" /><span className="h-20 flex-1 bg-[#0d6b62]" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-[#17211f]">{t.name}</h3>
              {selected === t.id && <span className="rounded-md bg-[#0d6b62] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Selected</span>}
            </div>
            <p className="mt-1 text-sm leading-5 text-[#64736f] line-clamp-2">{t.description}</p>
            <span className="mt-3 inline-block rounded-md bg-[#e3f2ef] px-2 py-1 text-[10px] font-bold tracking-wide text-[#09564f]">
              {t.category}
            </span>
          </motion.button>
        ))}
      </div>

      {!loading && !error && templates.length === 0 && (
        <div className="surface-muted mt-6 p-10 text-center"><LayoutTemplate aria-hidden className="mx-auto text-accent" size={32} /><p className="mt-3 font-semibold text-label">No templates yet</p><p className="mt-1 text-sm text-muted">Templates will appear here when the API is available.</p></div>
      )}
    </div>
  );
}
