'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('resume_builder_token');
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Checking your session…</div>;
  return <>{children}</>;
}
