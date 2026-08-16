import './globals.css';
import Link from 'next/link';
import { AppNav } from './components/app-nav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-sm text-white">R</span>
              Resume Builder
            </Link>
            <AppNav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">{children}</main>
      </body>
    </html>
  );
}
