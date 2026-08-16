'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.auth.me().then(result => {
      if (result.error || !result.data) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
      }
      setReady(true);
    });
  }, [pathname, router]);

  if (!ready) return <div className="surface mx-auto max-w-[1120px] p-6 text-sm text-[#64736f]">Checking your session…</div>;
  return <>{children}</>;
}
