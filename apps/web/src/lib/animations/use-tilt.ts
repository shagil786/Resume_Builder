'use client';

import { useRef, type MouseEvent } from 'react';
import { gsap } from '@/lib/animations/gsap';

/**
 * Subtle 3D perspective tilt toward the pointer (max ~4deg).
 * Spring return on exit. Pointer-fine devices only; no-op under
 * reduced motion.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 4) {
  const ref = useRef<T>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(el, {
      rotateY: px * maxDeg * 2,
      rotateX: -py * maxDeg * 2,
      transformPerspective: 800,
      duration: 0.45,
      ease: 'power2.out',
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
  };

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}
