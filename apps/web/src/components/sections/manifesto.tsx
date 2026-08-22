'use client';

import { ScrollWords } from '@/components/motion/scroll-words';

export function Manifesto() {
  return (
    <section className="border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-[1120px] px-5 lg:px-0">
        <p className="eyebrow">Why we exist</p>
        <ScrollWords
          text="Most resume tools help you exaggerate. Ours helps you prove. Every line on your resume traces back to something you actually did — reviewed by you, grounded in evidence, ready for any recruiter."
          className="mt-8 max-w-4xl text-[clamp(24px,3.6vw,44px)] font-semibold leading-[1.25] tracking-[-.02em] text-heading"
        />
      </div>
    </section>
  );
}
