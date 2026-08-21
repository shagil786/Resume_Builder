'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = () => {
    setChecking(true);
    setError(null);
    api.auth.me().then(result => {
      if (result.error || !result.data) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setReady(true);
    }).catch(() => setError('We could not verify your session. Check your connection and try again.'))
      .finally(() => setChecking(false));
  };

  useEffect(() => { checkSession(); }, [pathname, router]);

  if (checking && !ready) return <div className="surface mx-auto flex max-w-[1120px] items-center gap-3 p-6 text-sm text-muted" role="status"><Loader2 aria-hidden className="animate-spin text-accent" size={16} /> Checking your session…</div>;
  if (error && !ready) return <div className="page-shell"><div className="status-error mx-auto max-w-xl p-6" role="alert"><p className="font-semibold">Session check unavailable</p><p className="mt-2 text-sm">{error}</p><button type="button" onClick={checkSession} className="btn btn-secondary mt-5 min-h-[36px] text-xs">Try again</button></div></div>;
  if (!ready) return null;
  return <>{children}</>;
}
