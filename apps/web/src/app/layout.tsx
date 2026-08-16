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
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">Resume Builder</Link>
            <nav className="flex gap-5 text-sm text-slate-300">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
