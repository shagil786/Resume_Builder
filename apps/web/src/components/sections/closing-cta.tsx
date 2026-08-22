'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { useReveal } from '@/lib/animations/use-reveal';

export function ClosingCTA() {
  const ref = useReveal<HTMLDivElement>({ y: 40 });

  return (
    <section className="relative overflow-hidden py-32 text-center sm:py-44">
      {/* soft radial accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.13]"
        style={{ background: 'radial-gradient(closest-side, var(--accent), transparent)' }}
      />
      <div ref={ref} className="relative mx-auto max-w-2xl px-5">
        <p className="eyebrow">Ready when you are</p>
        <h2 className="mt-6 text-[clamp(38px,5.5vw,72px)] font-bold leading-[1.04] tracking-[-.03em] text-heading">
          Your next resume is already in you.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-muted">
          Upload once, review your facts, and tailor a verified application for every role.
        </p>
        <div className="mt-12">
          <MagneticButton>
            <Link href="/login" className="btn btn-primary h-14 px-8 text-[15px]">
              Start building <ArrowRight aria-hidden size={17} />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
