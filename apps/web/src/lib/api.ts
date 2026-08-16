const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CandidateProfileResponse {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    piiFields: { path: string; visibility: 'USER_ONLY' | 'HIRING_MANAGER' | 'PUBLIC' }[];
  };
  summary?: string;
  status: 'DRAFT' | 'FINALIZED';
  workExperience: unknown[];
  projects: unknown[];
  skills: unknown[];
  education: unknown[];
  certifications: unknown[];
  sourceDocuments: unknown[];
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error ?? body.message ?? `HTTP ${res.status}` };
    }
    if (res.status === 204) return {};
    const data = await res.json();
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) => request<{ user: { email: string; name: string } }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) => request<{ user: { email: string; name: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<{ email: string; name: string }>('/auth/me'),
    logout: () => request<{ status: string }>('/auth/logout', { method: 'POST' }),
  },
  candidates: {
    create: (body: { personalInfo: Record<string, unknown> }) =>
      request<{ profileId: string }>('/candidates', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request<CandidateProfileResponse>(`/candidates/${id}`),
    update: (id: string, body: Record<string, unknown>) =>
      request<{ status: string }>(`/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/candidates/${id}`, { method: 'DELETE' }),
    addExperience: (id: string, body: Record<string, unknown>) =>
      request<{ experienceId: string }>(`/candidates/${id}/experience`, { method: 'POST', body: JSON.stringify(body) }),
    addProject: (id: string, body: Record<string, unknown>) =>
      request<{ projectId: string }>(`/candidates/${id}/projects`, { method: 'POST', body: JSON.stringify(body) }),
    addSkill: (id: string, body: Record<string, unknown>) =>
      request<{ skillId: string }>(`/candidates/${id}/skills`, { method: 'POST', body: JSON.stringify(body) }),
    addEducation: (id: string, body: Record<string, unknown>) =>
      request<{ educationId: string }>(`/candidates/${id}/education`, { method: 'POST', body: JSON.stringify(body) }),
    addCertification: (id: string, body: Record<string, unknown>) =>
      request<{ certificationId: string }>(`/candidates/${id}/certifications`, { method: 'POST', body: JSON.stringify(body) }),
    searchFacts: (id: string, query: string) =>
      request<{ facts: unknown[]; total: number }>(`/candidates/${id}/facts/search`, { method: 'POST', body: JSON.stringify({ query }) }),
    updateFactStatus: (profileId: string, factId: string, status: string, verificationNotes?: string) =>
      request<{ status: string }>(`/candidates/${profileId}/facts/${factId}/status`, { method: 'PATCH', body: JSON.stringify({ status, verificationNotes }) }),
    generate: (id: string, body: { jobDescription?: string; jobUrl?: string; company: string; title: string; templateId?: string }) =>
      request<Record<string, unknown>>(`/candidates/${id}/generate`, { method: 'POST', body: JSON.stringify(body) }),
    generations: (id: string) => request<{ runs: { id: string; status: string; startedAt: string; completedAt?: string; templateId: string }[] }>(`/candidates/${id}/generations`),
    generation: (id: string, runId: string) => request<{ run: { id: string; status: string }; resume: { sections: unknown[]; metadata: Record<string, unknown> }; factCheck: { valid: boolean; issues: unknown[] } }>(`/candidates/${id}/generations/${runId}`),
    generationPreview: (id: string, runId: string) => fetch(`${API_BASE}/candidates/${id}/generations/${runId}/preview`, { credentials: 'include' }).then(async response => response.ok ? response.text() : null),
    upload: async (id: string, file: File): Promise<ApiResponse<Record<string, unknown>>> => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/candidates/${id}/documents`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      return res.ok ? { data } : { error: data.error ?? `HTTP ${res.status}` };
    },
  },
  templates: {
    list: () => request<{ templates: { id: string; name: string; description: string; category: string }[] }>('/candidates/templates'),
    get: (id: string) => request<Record<string, unknown>>(`/candidates/templates/${id}`),
  },
  render: (profileId: string, templateId?: string) =>
    fetch(`${API_BASE}/candidates/${profileId}/render`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    }).then(async response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    }),
};
