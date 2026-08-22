'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroSceneLazy } from '@/components/three/hero-scene-lazy';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { useSplitReveal } from '@/lib/animations/use-split-reveal';
import { useReveal } from '@/lib/animations/use-reveal';

export function SiteHero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useSplitReveal(headlineRef, { types: 'lines', stagger: 0.12 });
  const subRef = useReveal<HTMLDivElement>({ delay: 0.35 });

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <HeroSceneLazy />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-5 lg:px-0">
        <p className="eyebrow">A calmer way to apply</p>
        <h1
          ref={headlineRef}
          className="mt-6 max-w-[13ch] font-bold leading-[0.98] tracking-[-.04em] text-heading"
          style={{ fontSize: 'clamp(46px, 8.5vw, 108px)' }}
        >
          Make your experience easier to see.
        </h1>

        <div ref={subRef} className="mt-9 max-w-xl">
          <p className="text-lg leading-8 text-muted">
            Build a focused resume for each role from the experience you already have.
            Review every extracted fact, keep your story honest, and apply with confidence.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Link href="/login" className="btn btn-primary h-14 px-7 text-[15px]">
                Start with your resume <ArrowRight aria-hidden size={17} />
              </Link>
            </MagneticButton>
            <Link href="/templates" className="btn btn-secondary h-14 px-6 text-[15px]">
              Explore templates
            </Link>
          </div>
          <p className="mt-6 text-xs font-medium tracking-wide text-subtle">
            PDF & DOCX supported · Every fact stays reviewable
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" aria-hidden>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-line p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
