'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { LayoutTemplate } from 'lucide-react';
import { api } from '../../lib/api';
import { getSelectedTemplateId, setSelectedTemplateId } from '../../lib/template';
import { Skeleton } from '../components/skeleton';
import { useTilt } from '@/lib/animations/use-tilt';

interface Template { id: string; name: string; description: string; category: string; }

function TemplateCard({ t, selected, onChoose }: {
  t: Template;
  selected: boolean;
  onChoose: (id: string) => void;
}) {
  const tilt = useTilt<HTMLButtonElement>(3);

  return (
    <motion.button
      ref={tilt.ref}
      onClick={() => onChoose(t.id)}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
      className={`surface p-4 text-left transition-colors will-change-transform ${
        selected
          ? 'border-accent bg-accent-soft ring-2 ring-line-accent'
          : 'hover:border-line-accent'
      }`}>
      <div className="mb-1 flex h-32 items-end gap-1 rounded-md border border-line bg-accent-wash p-4">
        <span className="h-16 w-1/4 rounded-sm bg-[#c8ded9]" /><span className="h-24 w-1/3 rounded-sm bg-[#8cbdb5]" /><span className="h-20 flex-1 rounded-sm bg-accent" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-heading">{t.name}</h3>
        {selected && <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Selected</span>}
      </div>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{t.description}</p>
      <span className="mt-3 inline-block rounded-md bg-accent-soft px-2 py-1 text-[10px] font-bold tracking-wide text-accent-strong">
        {t.category}
      </span>
    </motion.button>
  );
}

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
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}>
            <TemplateCard t={t} selected={selected === t.id} onChoose={chooseTemplate} />
          </motion.div>
        ))}
      </div>

      {!loading && !error && templates.length === 0 && (
        <div className="surface-muted mt-6 p-10 text-center"><LayoutTemplate aria-hidden className="mx-auto text-accent" size={32} /><p className="mt-3 font-semibold text-label">No templates yet</p><p className="mt-1 text-sm text-muted">Templates will appear here when the API is available.</p></div>
      )}
    </div>
  );
}
