import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const footerNav = [
  { href: '/dashboard', label: 'Workspace' },
  { href: '/profile', label: 'Profile' },
  { href: '/templates', label: 'Templates' },
  { href: '/history', label: 'Versions' },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-canvas-tint">
      <div className="mx-auto max-w-[1120px] px-5 pb-10 pt-20 lg:px-0">
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-heading">Resume Builder</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
              An evidence-grounded resume compiler. Every claim traceable, every version kept.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-3">
            {footerNav.map(item => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted transition-colors hover:text-accent-strong">
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        {/* Oversized brand close — SVG scales to full width, never crops */}
        <div className="mt-16 select-none" aria-hidden>
          <svg viewBox="0 0 1000 130" className="w-full" role="presentation">
            <text
              x="500"
              y="104"
              textAnchor="middle"
              textLength="984"
              lengthAdjust="spacingAndGlyphs"
              fontSize="118"
              fontWeight="700"
              letterSpacing="-2"
              fill="transparent"
              stroke="var(--line-accent)"
              strokeWidth="1"
            >
              RESUME BUILDER
            </text>
          </svg>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} Resume Builder. Built for honest applications.</p>
          <p>Verified facts · Deterministic rendering</p>
        </div>
      </div>
    </footer>
  );
}
