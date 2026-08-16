'use client';
export default function HistoryPage() {
  return (
    <div>
      <h1 style={h1}>Version History</h1>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #e0e0e0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#999', margin: 0 }}>No versions yet. Generate a resume to see history here.</p>
      </div>
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
