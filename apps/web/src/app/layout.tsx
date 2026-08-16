import './globals.css';
import Link from 'next/link';
import { AppNav } from './components/app-nav';

export const metadata = {
  title: 'Resume Builder',
  description: 'Build evidence-grounded resumes for the roles you want.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-[#d9e2df] bg-white">
          <div className="mx-auto flex min-h-[72px] max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-0">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0d6b62] text-sm font-bold text-white">R</span>
              <span><span className="block text-[15px] leading-4">Resume Builder</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#64736f]">Career workspace</span></span>
            </Link>
            <AppNav />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
