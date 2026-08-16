'use client';
import { useEffect, useState } from 'react';
import { api, type CandidateProfileResponse } from '../../lib/api';
import { AuthGuard } from '../components/auth-guard';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
};

const emptyForm: ProfileForm = { firstName: '', lastName: '', email: '', phone: '', location: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '', summary: '' };

function profileToForm(profile: CandidateProfileResponse): ProfileForm {
  return { ...emptyForm, ...profile.personalInfo, summary: profile.summary ?? '' };
}

export default function ProfilePage() {
  const [profileId, setProfileId] = useState('');
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedId = window.localStorage.getItem('resume_builder_profile_id');
    if (!savedId) { setLoading(false); return; }
    setProfileId(savedId);
    api.candidates.get(savedId).then(response => {
      if (response.data) setForm(profileToForm(response.data));
      else setError(response.error ?? 'Unable to load your profile');
      setLoading(false);
    });
  }, []);

  const setField = (field: keyof ProfileForm, value: string) => setForm(current => ({ ...current, [field]: value }));

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setStatus(null); setError(null);
    const personalInfo = { firstName: form.firstName, lastName: form.lastName, email: form.email || undefined, phone: form.phone || undefined, location: form.location || undefined, linkedinUrl: form.linkedinUrl || undefined, githubUrl: form.githubUrl || undefined, portfolioUrl: form.portfolioUrl || undefined, piiFields: [] };
    const response = profileId
      ? await api.candidates.update(profileId, { personalInfo, summary: form.summary })
      : await api.candidates.create({ personalInfo });
    if (response.error || !response.data) setError(response.error ?? 'Unable to save your profile');
    else {
      const id = profileId || ('profileId' in response.data ? response.data.profileId : '');
      window.localStorage.setItem('resume_builder_profile_id', id);
      setProfileId(id);
      if (!profileId) setStatus('Profile created. Your workspace is ready for a resume upload.');
      else setStatus('Profile saved.');
    }
    setSaving(false);
  };

  return <AuthGuard><div>
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Your foundation</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Candidate profile</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Start with the details you want employers to see. You can add experience, skills, and verified facts after your profile is saved.</p></div>{profileId && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Draft profile</span>}</div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading your profile…</div> : <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Contact details</h2><p className="mt-1 text-sm text-slate-500">These details will appear on your resume header.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{(['firstName','lastName','email','phone','location'] as const).map(field => <label key={field} className={`${field === 'location' ? 'sm:col-span-2' : ''} block text-sm font-medium capitalize text-slate-700`}>{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field}<input required={field === 'firstName' || field === 'lastName' || field === 'email'} type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={event => setField(field, event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600" /></label>)}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Professional links</h2><p className="mt-1 text-sm text-slate-500">Optional links help recruiters validate your work.</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{(['linkedinUrl','githubUrl','portfolioUrl'] as const).map(field => <label key={field} className="block text-sm font-medium text-slate-700">{field === 'linkedinUrl' ? 'LinkedIn' : field === 'githubUrl' ? 'GitHub' : 'Portfolio'}<input type="url" value={form[field]} onChange={event => setField(field, event.target.value)} placeholder="https://" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600" /></label>)}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Professional summary</h2><p className="mt-1 text-sm text-slate-500">A short overview gives the AI context before it tailors your resume.</p><textarea value={form.summary} onChange={event => setField('summary', event.target.value)} rows={5} placeholder="Example: Product designer with 6 years of experience building accessible workflow tools…" className="mt-5 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm leading-6 outline-none transition focus:border-teal-600" /></section>
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white"><p className="text-sm font-semibold text-teal-300">Next steps</p><h2 className="mt-3 text-xl font-semibold">Build your evidence base.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Once your profile is saved, upload a resume so we can extract experience and skills for your review.</p><button type="submit" disabled={saving} className="mt-6 w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50">{saving ? 'Saving…' : profileId ? 'Save profile' : 'Create profile'}</button>{profileId && <p className="mt-4 break-all text-xs text-slate-400">Profile ID: {profileId}</p>}{status && <p role="status" className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">{status}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}</aside>
      </form>}
    </div>
  </div></AuthGuard>;
}
