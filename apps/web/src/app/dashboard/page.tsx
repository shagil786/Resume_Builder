'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard';
import { AuthGuard } from '../components/auth-guard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => { getDashboardStats().then(setStats); }, []);

  return (
    <AuthGuard><div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your candidate profile</p>

      <div className="mt-6 grid grid-cols-5 gap-4">
        {cards.map(card => (
          <Link key={card.key} href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-shadow">
            <div className="text-3xl font-bold text-slate-900">{stats?.[card.key as keyof DashboardStats] ?? 0}</div>
            <div className="mt-1 text-sm text-slate-500">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex gap-3">
          <Link href="/upload" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Upload Resume</Link>
          <Link href="/job" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Analyze Job</Link>
          <Link href="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit Profile</Link>
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
