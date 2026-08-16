import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="page-shell space-y-20">
      <section className="grid items-center gap-12 pt-4 lg:grid-cols-[1fr_0.9fr] lg:pt-10">
        <div>
          <p className="eyebrow">A calmer way to apply</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-[-.045em] text-[#13201d] sm:text-[58px] sm:leading-[1.02]">Make your experience easier to see.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#64736f]">Build a focused resume for each role from the experience you already have. Review every extracted fact, keep your story honest, and apply with confidence.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn btn-primary">Start with your resume <span aria-hidden>→</span></Link>
            <Link href="/templates" className="btn btn-secondary">Explore templates</Link>
          </div>
          <p className="mt-4 text-xs font-medium text-[#8b9995]">PDF and DOCX supported · Your facts remain reviewable</p>
        </div>
        <div className="surface overflow-hidden bg-[#14231f] p-3 sm:p-4">
          <div className="rounded-[14px] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-[#e6ece9] pb-5">
              <div><p className="eyebrow">Resume workspace</p><p className="mt-2 text-xl font-bold tracking-tight text-[#17211f]">Product Designer <span className="font-normal text-[#8b9995]">· v3</span></p></div>
              <span className="shrink-0 rounded-md bg-[#e3f2ef] px-2.5 py-1.5 text-[11px] font-bold text-[#09564f]">Ready to review</span>
            </div>
            <div className="mt-6 space-y-3">
              {['Experience matched to the role', 'Skills backed by source evidence', 'Layout checked for readability'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 border-b border-[#edf1ef] py-3 last:border-0"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e3f2ef] text-xs font-bold text-[#0d6b62]">{index + 1}</span><span className="text-sm font-semibold text-[#32433e]">{item}</span><span className="ml-auto text-sm font-bold text-[#087443]">✓</span></div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#64736f]"><span>Profile readiness</span><span>80%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeeb]"><div className="h-full w-4/5 bg-[#0d6b62]" /></div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-xl"><p className="eyebrow">A better workflow</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17211f] sm:text-3xl">From raw resume to confident application.</h2></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((f, index) => <div key={f.title} className="border-t-2 border-[#c8ded9] pt-5"><span className="text-xs font-bold text-[#0d6b62]">0{index + 1}</span><h3 className="mt-6 font-semibold text-[#17211f]">{f.title}</h3><p className="mt-2 text-sm leading-6 text-[#64736f]">{f.desc}</p></div>)}
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: '📄', title: 'Upload Resume', desc: 'Parse PDFs and DOCX into structured career facts with source tracking.' },
  { icon: '🎯', title: 'Analyze Jobs', desc: 'Extract requirements, skills, and keywords from any job description.' },
  { icon: '✨', title: 'Generate Resume', desc: 'AI writes tailored content using only your verified facts.' },
];
