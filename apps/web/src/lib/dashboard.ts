export interface DashboardStats {
  profileId?: string;
  experienceCount: number;
  skillCount: number;
  projectCount: number;
  educationCount: number;
  certificationCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return { experienceCount: 0, skillCount: 0, projectCount: 0, educationCount: 0, certificationCount: 0 };
}
