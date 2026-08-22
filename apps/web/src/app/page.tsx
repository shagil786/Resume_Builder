'use client';

import { SiteHero } from '@/components/sections/site-hero';
import { Manifesto } from '@/components/sections/manifesto';
import { Process } from '@/components/sections/process';
import { Proof } from '@/components/sections/proof';
import { ClosingCTA } from '@/components/sections/closing-cta';

export default function HomePage() {
  return (
    <>
      <SiteHero />
      <Manifesto />
      <Process />
      <Proof />
      <ClosingCTA />
    </>
  );
}
