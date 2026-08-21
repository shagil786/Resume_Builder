import Link from 'next/link';
import { ArrowRight, Check, FileUp, Target, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="page-shell space-y-20">
      <section className="grid items-center gap-12 pt-4 lg:grid-cols-[1fr_0.9fr] lg:pt-10">
        <div>
          <p className="eyebrow">A calmer way to apply</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-[-.045em] text-heading sm:text-[58px] sm:leading-[1.02]">Make your experience easier to see.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-muted">Build a focused resume for each role from the experience you already have. Review every extracted fact, keep your story honest, and apply with confidence.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn btn-primary">Start with your resume <ArrowRight aria-hidden size={16} /></Link>
            <Link href="/templates" className="btn btn-secondary">Explore templates</Link>
          </div>
          <p className="mt-4 text-xs font-medium text-muted">PDF and DOCX supported · Your facts remain reviewable</p>
        </div>
        <div className="surface overflow-hidden bg-[#14231f] p-3 shadow-md sm:p-4">
          <div className="rounded-[14px] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-[#e6ece9] pb-5">
              <div><p className="eyebrow">Resume workspace</p><p className="mt-2 text-xl font-bold tracking-tight text-ink">Product Designer <span className="font-normal text-muted">· v3</span></p></div>
              <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-1.5 text-[11px] font-bold text-accent-strong">Ready to review</span>
            </div>
            <div className="mt-6 space-y-3">
              {['Experience matched to the role', 'Skills backed by source evidence', 'Layout checked for readability'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 border-b border-[#edf1ef] py-3 last:border-0"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{index + 1}</span><span className="text-sm font-semibold text-label">{item}</span><Check aria-hidden className="ml-auto text-success" size={16} strokeWidth={3} /></div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-muted"><span>Profile readiness</span><span>80%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeeb]"><div className="h-full w-4/5 bg-accent" /></div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-xl"><p className="eyebrow">A better workflow</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">From raw resume to confident application.</h2></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="border-t-2 border-line-accent pt-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft text-accent"><Icon aria-hidden size={20} /></span>
                  <span className="text-xs font-bold text-faint">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: FileUp, title: 'Upload Resume', desc: 'Parse PDFs and DOCX into structured career facts with source tracking.' },
  { icon: Target, title: 'Analyze Jobs', desc: 'Extract requirements, skills, and keywords from any job description.' },
  { icon: Sparkles, title: 'Generate Resume', desc: 'AI writes tailored content using only your verified facts.' },
];
