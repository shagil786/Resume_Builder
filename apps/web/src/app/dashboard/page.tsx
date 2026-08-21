'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, FolderGit2, GraduationCap, BadgeCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard';
import { api } from '@/lib/api';
import { getCurrentProfileId } from '@/lib/profile';
import { AuthGuard } from '../components/auth-guard';
import { Skeleton } from '../components/skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [runs, setRuns] = useState<{ id: string; status: string; startedAt: string; templateId: string }[]>([]);
  const [profileId, setProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentProfileId().then(current => {
      if (!current.id) { setLoading(false); return; }
      setProfileId(current.id);
      return Promise.all([getDashboardStats(current.id), api.candidates.generations(current.id)])
      .then(([dashboardStats, generations]) => {
        setStats(dashboardStats);
        if (generations.data) setRuns(generations.data.runs.slice(0, 3));
        else if (generations.error) setError(generations.error);
      });
    }).catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load your workspace'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Your workspace</p><h1 className="page-title">Good work starts with good evidence.</h1><p className="page-description">Keep your profile current, review what we extract, and tailor your next application from one place.</p></div><Link href="/job" className="btn btn-primary shrink-0">Build a resume <ArrowRight aria-hidden size={16} /></Link></div>

      {!loading && !profileId && <div className="status-info mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-bold">Set up your candidate profile first.</p><p className="mt-1 text-sm">Your profile is the source for facts, matching, and tailored resumes.</p></div><Link href="/profile" className="btn btn-primary shrink-0">Create profile</Link></div>}
      {error && <p role="alert" className="status-error mb-6 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const value = loading ? null : stats?.[card.key as keyof DashboardStats] ?? 0;
          return (
            <motion.div key={card.key}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}>
              <Link href={card.href}
                className="surface block p-4 transition hover:-translate-y-0.5 hover:border-line-accent sm:p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><Icon aria-hidden size={16} /></span>
                {value === null
                  ? <Skeleton className="mt-3 h-9 w-12" />
                  : <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</div>}
                <div className="mt-1 text-xs font-semibold text-muted">{card.label}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="surface mt-8 p-6 sm:p-7">
        <p className="eyebrow">Next best action</p><h2 className="mt-2 section-title">Move your application forward</h2><p className="section-description">Choose the step that matches where you are today.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/upload" className="btn btn-primary">Upload resume</Link>
          <Link href="/job" className="btn btn-secondary">Analyze a job</Link>
          <Link href="/profile" className="btn btn-secondary">Edit profile</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="surface p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Recent work</p><h2 className="mt-2 section-title">Your latest applications</h2></div><Link href="/history" className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-strong">View all <ArrowRight aria-hidden size={12} /></Link></div>
          {loading ? (
            <div className="mt-6 space-y-4">{[0, 1, 2].map(i => <div key={i} className="flex items-center justify-between gap-4"><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-6 w-16 rounded-md" /></div>)}</div>
          ) : runs.length === 0 ? <div className="surface-muted mt-6 p-5"><p className="font-semibold text-label">No generated resumes yet.</p><p className="mt-1 text-sm text-muted">Analyze a job to create your first tailored version.</p></div> : <div className="mt-5 divide-y divide-[#edf1ef]">{runs.map(run => <Link key={run.id} href={`/preview?runId=${encodeURIComponent(run.id)}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="text-sm font-semibold text-ink">{run.templateId} resume</p><p className="mt-1 text-xs text-muted">{new Date(run.startedAt).toLocaleDateString()}</p></div><span className="rounded-md bg-accent-soft px-2 py-1 text-[10px] font-bold text-success">{run.status}</span></Link>)}</div>}
        </div>
        <div className="surface-muted p-6 sm:p-7"><p className="eyebrow">Profile readiness</p><div className="mt-3 flex items-end justify-between"><span className="text-4xl font-bold tracking-tight text-ink">{stats ? Math.min(100, Math.round(([stats.experienceCount, stats.skillCount, stats.projectCount, stats.educationCount, stats.certificationCount].filter(count => count > 0).length / 5) * 100)) : 0}%</span><span className="text-xs font-semibold text-muted">5 areas</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce8e4]"><div className="h-full bg-accent transition-all" style={{ width: `${stats ? Math.min(100, Math.round(([stats.experienceCount, stats.skillCount, stats.projectCount, stats.educationCount, stats.certificationCount].filter(count => count > 0).length / 5) * 100)) : 0}%` }} /></div><p className="mt-4 text-sm leading-6 text-muted">Add the details that help us write a specific, credible resume for each role.</p><Link href="/profile" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-accent">Complete profile <ArrowRight aria-hidden size={14} /></Link></div>
      </section>
    </div></AuthGuard>
  );
}

const cards: { key: string; label: string; href: string; icon: LucideIcon }[] = [
  { key: 'experienceCount', label: 'Experiences', href: '/profile', icon: Briefcase },
  { key: 'skillCount', label: 'Skills', href: '/profile', icon: Wrench },
  { key: 'projectCount', label: 'Projects', href: '/profile', icon: FolderGit2 },
  { key: 'educationCount', label: 'Education', href: '/profile', icon: GraduationCap },
  { key: 'certificationCount', label: 'Certifications', href: '/profile', icon: BadgeCheck },
];
