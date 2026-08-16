'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Workspace' },
  { href: '/profile', label: 'My profile' },
  { href: '/facts', label: 'Facts' },
  { href: '/templates', label: 'Templates' },
  { href: '/history', label: 'Versions' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden items-center gap-1 lg:flex">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(pathname, item.href) ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <Link href="/upload" className="text-sm font-medium text-slate-600 transition hover:text-teal-700">Upload resume</Link>
        <Link href="/job" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">Build a resume</Link>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <Link href="/job" className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white">Build</Link>
        <button type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(value => !value)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">
          <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
          <span className="block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && <div id="mobile-navigation" className="border-t border-slate-100 pb-3 pt-3 lg:hidden">
        <nav aria-label="Mobile navigation" className="grid gap-1">
          {navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(pathname, item.href) ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'}`}>{item.label}</Link>)}
          <Link href="/upload" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Upload resume</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Account</Link>
        </nav>
      </div>}
    </>
  );
}
