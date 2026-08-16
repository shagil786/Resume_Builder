import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Evidence-grounded career tools</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.05]">Build a resume that earns the interview.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Turn your real experience into a focused, job-specific resume. Every claim stays connected to your source evidence.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">Start with your resume</Link>
            <Link href="/templates" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-teal-600 hover:text-teal-700">Explore templates</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">PDF and DOCX supported · Your facts remain reviewable</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-xl sm:p-8">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-teal-600/30 blur-3xl" />
          <div className="relative rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Resume workspace</p><p className="mt-1 text-lg font-bold text-slate-950">Product Designer · v3</p></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Ready to review</span>
            </div>
            <div className="mt-5 space-y-4">
              {['Experience matched to the role', 'Skills backed by source evidence', 'Layout checked for readability'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-sm text-teal-700">{index + 1}</span><span className="text-sm font-medium text-slate-700">{item}</span><span className="ml-auto text-teal-700">✓</span></div>
              ))}
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-teal-600" /></div>
            <p className="mt-2 text-right text-xs text-slate-500">80% of your profile is ready</p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-xl"><p className="text-sm font-semibold text-teal-700">A better workflow</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">From raw resume to confident application.</h2></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((f, index) => <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="text-xs font-bold text-teal-700">0{index + 1}</span><h3 className="mt-8 font-semibold text-slate-950">{f.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{f.desc}</p></div>)}
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
