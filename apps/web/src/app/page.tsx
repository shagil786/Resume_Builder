import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>AI Resume Builder</h1>
      <p style={{ fontSize: 16, color: '#666', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
        Upload your resume, paste a job description, and get an AI-generated tailored resume with verified facts.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link href="/upload" style={buttonStyle}>Upload Resume</Link>
        <Link href="/job" style={{ ...buttonStyle, background: '#fff', color: '#1a1a2e', border: '1px solid #1a1a2e' }}>Enter Job</Link>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block', padding: '12px 24px', background: '#1a1a2e', color: '#fff',
  textDecoration: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600,
};
