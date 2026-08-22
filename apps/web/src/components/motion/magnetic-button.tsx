'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { gsap } from '@/lib/animations/gsap';

/**
 * Wraps a CTA and pulls it gently toward the pointer (max ~6px),
 * springing back on exit. Pointer-fine devices only; disabled under
 * reduced motion by simply not attaching listeners there is handled
 * via matchMedia check.
 */
export function MagneticButton({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, { x: relX * 0.18, y: relY * 0.28, duration: 0.4, ease: 'power3.out' });
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <span
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}
