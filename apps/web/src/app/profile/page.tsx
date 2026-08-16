'use client';
import { useState } from 'react';

export default function ProfilePage() {
  const [profileId, setProfileId] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const createProfile = async () => {
    const userId = `user-${Date.now()}`;
    const res = await fetch('/api/v1/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, personalInfo: { firstName: '', lastName: '', piiFields: [] } }),
    });
    const data = await res.json();
    setProfileId(data.profileId);
    setStatus(`Created: ${data.profileId}`);
  };

  return (
    <div>
      <h1 style={h1}>Profile</h1>
      <button onClick={createProfile} style={btn}>Create New Profile</button>
      {status && <p style={{ marginTop: 12, fontSize: 14, color: '#333' }}>{status}</p>}
      {profileId && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>Profile ID: {profileId}</p>
          <p style={{ fontSize: 13, color: '#999' }}>Full profile editor coming soon. Use the API for now.</p>
        </div>
      )}
    </div>
  );
}

const h1: React.CSSProperties = { fontSize: 24, fontWeight: 700, margin: '0 0 20px' };
const btn: React.CSSProperties = {
  padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none',
  borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
