'use client';

import { AnimatedCounter } from '@/components/motion/animated-counter';

const stats = [
  { value: 100, suffix: '%', label: 'Claims traceable to evidence' },
  { value: 5, suffix: '', label: 'Verification stages per resume' },
  { value: 1, suffix: '', label: 'Source of truth for your career', decimals: 0 },
];

export function Proof() {
  return (
    <section className="border-y border-line bg-canvas-tint py-20">
      <div className="mx-auto grid max-w-[1120px] gap-12 px-5 sm:grid-cols-3 lg:px-0">
        {stats.map(stat => (
          <div key={stat.label}>
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              className="text-[clamp(48px,6vw,80px)] font-bold leading-none tracking-[-.03em] text-heading"
            />
            <p className="mt-4 max-w-[24ch] text-sm font-medium leading-6 text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
