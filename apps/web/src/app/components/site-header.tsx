'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppNav } from './app-nav';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-paper/80 shadow-xs backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex min-h-[72px] max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-heading">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#12857a] to-accent-strong text-sm font-bold text-white shadow-xs">R</span>
          <span><span className="block text-[15px] leading-4">Resume Builder</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-muted">Career workspace</span></span>
        </Link>
        <AppNav />
      </div>
    </header>
  );
}
