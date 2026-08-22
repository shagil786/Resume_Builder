'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';

/**
 * Words fade from dim to full ink as the user scrolls through the block
 * (scrubbed). The classic "manifesto" reveal. Reduced-motion: static full
 * contrast.
 */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = text.split(' ');
    el.innerHTML = words
      .map(w => `<span class="sw" style="color:var(--muted)">${w}</span>`)
      .join(' ');
    const spans = el.querySelectorAll<HTMLSpanElement>('.sw');

    const ctx = gsap.context(() => {
      gsap.to(spans, {
        color: 'var(--color-heading)',
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.6,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}
