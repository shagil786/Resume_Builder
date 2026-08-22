'use client';

import { useSmoothScroll } from '@/lib/animations/gsap';

/** Mounts Lenis smooth scrolling (reduced-motion safe). */
export function SmoothScroll() {
  useSmoothScroll();
  return null;
}
