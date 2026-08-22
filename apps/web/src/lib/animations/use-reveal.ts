'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';

/**
 * Fades + slides an element in when it enters the viewport.
 * Reduced-motion safe (content simply appears).
 */
export function useReveal<T extends HTMLElement>(options: {
  y?: number;
  start?: string;
  duration?: number;
  delay?: number;
  enabled?: boolean;
} = {}) {
  const { y = 32, start = 'top 85%', duration = 0.9, delay = 0, enabled = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        autoAlpha: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [y, start, duration, delay, enabled]);

  return ref;
}
