import './globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppNav } from './components/app-nav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'Resume Builder',
    template: '%s · Resume Builder',
  },
  description: 'Build evidence-grounded resumes for the roles you want.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex min-h-[72px] max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-0">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-heading">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#12857a] to-accent-strong text-sm font-bold text-white shadow-xs">R</span>
              <span><span className="block text-[15px] leading-4">Resume Builder</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.14em] text-muted">Career workspace</span></span>
            </Link>
            <AppNav />
          </div>
        </header>
        <main>{children}</main>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
