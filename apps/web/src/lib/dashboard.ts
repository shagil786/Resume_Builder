import { api } from './api';

export interface DashboardStats {
  profileId?: string;
  experienceCount: number;
  skillCount: number;
  projectCount: number;
  educationCount: number;
  certificationCount: number;
}

export async function getDashboardStats(profileId: string): Promise<DashboardStats> {
  const response = await api.candidates.get(profileId);
  if (!response.data) throw new Error(response.error ?? 'Unable to load your profile');
  return {
    profileId,
    experienceCount: response.data.workExperience.length,
    skillCount: response.data.skills.length,
    projectCount: response.data.projects.length,
    educationCount: response.data.education.length,
    certificationCount: response.data.certifications.length,
  };
}
