'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => { getDashboardStats().then(setStats); }, []);

  return (
    <div>
      <h1 style={h1}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(card => (
          <Link key={card.key} href={card.href} style={cardStyle}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{stats?.[card.key as keyof DashboardStats] ?? 0}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{card.label}</div>
          </Link>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #e0e0e0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/upload" style={btn}>Upload Resume</Link>
          <Link href="/job" style={btn}>Analyze Job</Link>
          <Link href="/profile" style={btn}>Edit Profile</Link>
        </div>
      </div>
    </div>
  );
}

const cards = [
  { key: 'experienceCount', label: 'Experiences', href: '/profile' },
  { key: 'skillCount', label: 'Skills', href: '/profile' },
  { key: 'projectCount', label: 'Projects', href: '/profile' },
  { key: 'educationCount', label: 'Education', href: '/profile' },
  { key: 'certificationCount', label: 'Certifications', href: '/profile' },
];

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0',
  textDecoration: 'none', display: 'block',
};
const btn: React.CSSProperties = {
  display: 'inline-block', padding: '8px 16px', background: '#1a1a2e', color: '#fff',
  borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
};
