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

  return <AuthGuard><div className="page-shell">
    <div className="space-y-8">
      <div className="page-header"><div><p className="eyebrow">Your foundation</p><h1 className="page-title">Candidate profile</h1><p className="page-description">Start with the details you want employers to see. Add experience, skills, and verified facts after your profile is saved.</p></div>{profileId && <span className="rounded-md bg-[#e3f2ef] px-3 py-1.5 text-xs font-bold text-[#087443]">Draft profile</span>}</div>

      {loading ? <div className="surface p-8 text-sm text-[#64736f]">Loading your profile…</div> : <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="surface p-6"><h2 className="section-title">Contact details</h2><p className="section-description">These details will appear on your resume header.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{(['firstName','lastName','email','phone','location'] as const).map(field => <label key={field} className={`${field === 'location' ? 'sm:col-span-2' : ''} field-label`}>{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field}<input required={field === 'firstName' || field === 'lastName' || field === 'email'} type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={event => setField(field, event.target.value)} className="field-control" /></label>)}</div></section>
          <section className="surface p-6"><h2 className="section-title">Professional links</h2><p className="section-description">Optional links help recruiters validate your work.</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{(['linkedinUrl','githubUrl','portfolioUrl'] as const).map(field => <label key={field} className="field-label">{field === 'linkedinUrl' ? 'LinkedIn' : field === 'githubUrl' ? 'GitHub' : 'Portfolio'}<input type="url" value={form[field]} onChange={event => setField(field, event.target.value)} placeholder="https://" className="field-control" /></label>)}</div></section>
          <section className="surface p-6"><h2 className="section-title">Professional summary</h2><p className="section-description">A short overview gives the generator context before it tailors your resume.</p><textarea value={form.summary} onChange={event => setField('summary', event.target.value)} rows={5} placeholder="Example: Product designer with 6 years of experience building accessible workflow tools…" className="field-control mt-5 resize-y leading-6" /></section>
        </div>
        <aside className="surface-muted h-fit bg-[#14231f] p-6 text-white"><p className="eyebrow text-[#8cd1c5]">Next steps</p><h2 className="mt-3 text-xl font-semibold">Build your evidence base.</h2><p className="mt-3 text-sm leading-6 text-[#c4d2ce]">Once your profile is saved, upload a resume so we can extract experience and skills for your review.</p><button type="submit" disabled={saving} className="btn mt-6 w-full bg-[#8cd1c5] text-[#14231f] hover:bg-[#a9ded5] disabled:opacity-50">{saving ? 'Saving…' : profileId ? 'Save profile' : 'Create profile'}</button>{profileId && <p className="mt-4 break-all text-xs text-[#9eb2ac]">Profile ID: {profileId}</p>}{status && <p role="status" className="mt-4 rounded-md bg-[#8cd1c5]/10 p-3 text-sm text-[#bfe8df]">{status}</p>}{error && <p role="alert" className="mt-4 rounded-md bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}</aside>
      </form>}
    </div>
  </div></AuthGuard>;
}
