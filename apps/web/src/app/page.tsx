import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-slate-900">AI Resume Builder</h1>
      <p className="mt-4 max-w-lg text-lg text-slate-500">
        Upload your resume, paste a job description, and get an AI-generated tailored resume
        with verifiable facts and professional formatting.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/upload" className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
          Upload Resume
        </Link>
        <Link href="/job" className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
          Enter Job Description
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
          Dashboard
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-3 gap-8 text-left max-w-2xl">
        {features.map(f => (
          <div key={f.title}>
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: '📄', title: 'Upload Resume', desc: 'Parse PDFs and DOCX into structured career facts with source tracking.' },
  { icon: '🎯', title: 'Analyze Jobs', desc: 'Extract requirements, skills, and keywords from any job description.' },
  { icon: '✨', title: 'Generate Resume', desc: 'AI writes tailored content using only your verified facts.' },
];
