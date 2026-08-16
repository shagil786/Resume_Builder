import './globals.css';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/login', label: 'Sign in' },
  { href: '/profile', label: 'Profile' },
  { href: '/upload', label: 'Upload' },
  { href: '/job', label: 'Job' },
  { href: '/templates', label: 'Templates' },
  { href: '/preview', label: 'Preview' },
  { href: '/history', label: 'History' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-sm text-white">R</span>
              Resume Builder
            </Link>
            <nav aria-label="Primary navigation" className="flex w-full gap-5 overflow-x-auto pb-1 text-sm text-slate-500 sm:w-auto sm:pb-0">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className="shrink-0 whitespace-nowrap transition-colors hover:text-teal-700">{item.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">{children}</main>
      </body>
    </html>
  );
}
