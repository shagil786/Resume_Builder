import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/upload', label: 'Upload Resume' },
  { href: '/job', label: 'Job Description' },
  { href: '/templates', label: 'Templates' },
  { href: '/history', label: 'History' },
];

export default function Header() {
  return (
    <header style={styles.header}>
      <Link href="/" style={styles.logo}>Resume Builder</Link>
      <nav style={styles.nav}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={styles.link}>{item.label}</Link>
        ))}
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: '#1a1a2e', color: '#fff',
  },
  logo: { fontSize: 18, fontWeight: 700, color: '#fff', textDecoration: 'none' },
  nav: { display: 'flex', gap: 16 },
  link: { color: '#ccc', textDecoration: 'none', fontSize: 14 },
};
