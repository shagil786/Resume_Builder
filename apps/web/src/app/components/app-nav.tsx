'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    api.auth.me().then(result => setAuthenticated(Boolean(result.data))).catch(() => setAuthenticated(false));
  }, []);

  const signOut = async () => {
    await api.auth.logout();
    setAuthenticated(false);
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      <div className="hidden items-center gap-0.5 lg:flex">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`rounded-md px-3 py-2 text-[13px] font-semibold transition ${isActive(pathname, item.href) ? 'bg-[#e3f2ef] text-[#09564f]' : 'text-[#64736f] hover:bg-[#f3f7f6] hover:text-[#17211f]'}`}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <Link href="/upload" className="mr-2 text-[13px] font-semibold text-[#64736f] transition hover:text-[#0d6b62]">Upload resume</Link>
        {authenticated && <button type="button" onClick={() => void signOut()} className="btn btn-quiet min-h-[40px] px-3 text-[13px]">Sign out</button>}
        <Link href="/job" className="btn btn-primary min-h-[40px]">Build a resume</Link>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <Link href="/job" className="btn btn-primary min-h-[38px] px-3 text-xs">Build</Link>
        <button type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(value => !value)} className="rounded-md border border-[#d9e2df] p-2 text-[#32433e] hover:bg-[#f3f7f6]">
          <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
          <span className="block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {open && <div id="mobile-navigation" className="w-full border-t border-[#edf1ef] pb-3 pt-3 lg:hidden">
        <nav aria-label="Mobile navigation" className="grid gap-1">
          {navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-md px-3 py-2.5 text-sm font-semibold ${isActive(pathname, item.href) ? 'bg-[#e3f2ef] text-[#09564f]' : 'text-[#32433e] hover:bg-[#f3f7f6]'}`}>{item.label}</Link>)}
          <Link href="/upload" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#32433e] hover:bg-[#f3f7f6]">Upload resume</Link>
          {authenticated ? <button type="button" onClick={() => void signOut()} className="rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#32433e] hover:bg-[#f3f7f6]">Sign out</button> : <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-semibold text-[#32433e] hover:bg-[#f3f7f6]">Account</Link>}
        </nav>
      </div>}
    </>
  );
}
