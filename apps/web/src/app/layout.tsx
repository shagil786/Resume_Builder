import Header from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, -apple-system, sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
