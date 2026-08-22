'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';
import { FileUp, Crosshair, Sparkles } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: FileUp,
    title: 'Upload your evidence',
    desc: 'Drop in a PDF or DOCX. We parse it into structured career facts — each one sourced, confidence-scored, and waiting for your review.',
  },
  {
    num: '02',
    icon: Crosshair,
    title: 'Align to the role',
    desc: 'Paste a job description or link. We extract its real requirements and match them against your verified evidence — gaps included.',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Generate with proof',
    desc: 'A tailored, ATS-ready draft where every claim cites the fact it came from. Flagged claims are auto-revised before you ever see them.',
  },
];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // One pinned chapter (§28: avoid pinning everything). The left title stays
  // fixed while steps scroll; a hairline progress rule draws alongside.
  const initPin = (el: HTMLElement | null) => {
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    requestAnimationFrame(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.process-sticky',
        pinSpacing: false,
      });
      if (progressRef.current) {
        gsap.fromTo(progressRef.current, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top center', end: 'bottom center', scrub: 0.5 },
        });
      }
    });
  };

  return (
    <section ref={el => { sectionRef.current = el; initPin(el); }} className="relative border-t border-line">
      <div className="mx-auto grid max-w-[1120px] gap-16 px-5 py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-0 lg:py-36">
        <div className="process-sticky self-start lg:sticky lg:top-32">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-6 text-[clamp(36px,4.5vw,64px)] font-bold leading-[1.04] tracking-[-.03em] text-heading">
            From raw resume to confident application.
          </h2>
          <div className="mt-10 hidden h-40 w-px bg-line lg:block" aria-hidden>
            <div ref={progressRef} className="h-full w-px origin-top bg-accent" />
          </div>
        </div>

        <ol className="space-y-20 lg:space-y-32">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <li key={step.num} className="group relative pl-14 sm:pl-20">
                <span className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-paper text-accent shadow-xs transition-colors group-hover:border-line-accent" aria-hidden>
                  <Icon size={20} />
                </span>
                <span className="text-sm font-bold tracking-[.18em] text-muted">{step.num}</span>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl">{step.title}</h3>
                <p className="mt-4 max-w-md text-base leading-7 text-muted">{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
