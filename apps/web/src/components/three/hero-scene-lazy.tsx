'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => null,
});

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroSceneLazy() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && webglAvailable()) setAllowed(true);
  }, []);

  if (!allowed) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <HeroScene />
    </div>
  );
}
