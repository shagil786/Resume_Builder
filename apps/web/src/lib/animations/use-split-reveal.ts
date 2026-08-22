'use client';

import { useEffect } from 'react';
import SplitType from 'split-type';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';

/**
 * Reveals an element's text line-by-line (or word-by-word) with masked
 * translate-up animation when scrolled into view. Skips entirely under
 * reduced motion. Returns nothing; cleanup is automatic.
 */
export function useSplitReveal(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    types?: 'lines' | 'words' | 'chars';
    start?: string;
    stagger?: number;
    y?: number;
    once?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { types = 'lines', start = 'top 80%', stagger = 0.08, y = 44, once = true, enabled = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const split = new SplitType(el, { types });
    const targets = types === 'lines' ? split.lines : types === 'words' ? split.words : split.chars;
    if (!targets?.length) return;

    const ctx = gsap.context(() => {
      // Progressive enhancement: hide only now that JS is confirmed working,
      // then reveal. If anything fails before this point, text stays visible.
      gsap.set(targets, { autoAlpha: 0, yPercent: y });
      gsap.to(targets, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        stagger,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start, once },
        onComplete: () => split.revert(),
      });
    }, el);

    return () => {
      ctx.revert();
      split.revert();
      ScrollTrigger.refresh();
    };
  }, [ref, types, start, stagger, y, once, enabled]);
}
