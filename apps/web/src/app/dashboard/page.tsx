'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard';
import { AuthGuard } from '../components/auth-guard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => { getDashboardStats().then(setStats); }, []);

  return (
    <AuthGuard><div className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Your workspace</p><h1 className="page-title">Good work starts with good evidence.</h1><p className="page-description">Keep your profile current, review what we extract, and tailor your next application from one place.</p></div><Link href="/job" className="btn btn-primary shrink-0">Build a resume <span aria-hidden>→</span></Link></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(card => (
          <Link key={card.key} href={card.href}
            className="surface p-4 transition hover:-translate-y-0.5 hover:border-[#a9c8c1] sm:p-5">
            <div className="text-3xl font-bold tracking-tight text-[#17211f]">{stats?.[card.key as keyof DashboardStats] ?? 0}</div>
            <div className="mt-1 text-xs font-semibold text-[#64736f]">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="surface mt-8 p-6 sm:p-7">
        <p className="eyebrow">Next best action</p><h2 className="mt-2 section-title">Move your application forward</h2><p className="section-description">Choose the step that matches where you are today.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/upload" className="btn btn-primary">Upload resume</Link>
          <Link href="/job" className="btn btn-secondary">Analyze a job</Link>
          <Link href="/profile" className="btn btn-secondary">Edit profile</Link>
        </div>
      </div>
    </div></AuthGuard>
  );
}

const cards = [
  { key: 'experienceCount', label: 'Experiences', href: '/profile' },
  { key: 'skillCount', label: 'Skills', href: '/profile' },
  { key: 'projectCount', label: 'Projects', href: '/profile' },
  { key: 'educationCount', label: 'Education', href: '/profile' },
  { key: 'certificationCount', label: 'Certifications', href: '/profile' },
];
