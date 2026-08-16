'use client';
import { useState } from 'react';

export default function ProfilePage() {
  const [profileId, setProfileId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createProfile = async () => {
    setLoading(true);
    const userId = `user-${Date.now()}`;
    const res = await fetch('/api/v1/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, personalInfo: { firstName: '', lastName: '', piiFields: [] } }),
    });
    const data = await res.json();
    setProfileId(data.profileId);
    setStatus(`Created: ${data.profileId}`);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your candidate profile</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <button onClick={createProfile} disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity">
          {loading ? 'Creating...' : 'Create New Profile'}
        </button>

        {status && <p className="mt-3 text-sm text-slate-700">{status}</p>}

        {profileId && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            Profile ID: <code className="text-slate-700">{profileId}</code>
          </div>
        )}
      </div>
    </div>
  );
}
