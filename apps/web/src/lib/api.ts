const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('resume_builder_token') : null;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    register: (body: { email: string; password: string; name: string }) => request<{ token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) => request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  candidates: {
    create: (body: { personalInfo: Record<string, unknown> }) =>
      request<{ profileId: string }>('/candidates', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request<Record<string, unknown>>(`/candidates/${id}`),
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
    generate: (id: string, body: { jobDescription: string; company: string; title: string; templateId?: string }) =>
      request<Record<string, unknown>>(`/candidates/${id}/generate`, { method: 'POST', body: JSON.stringify(body) }),
    upload: async (id: string, file: File): Promise<ApiResponse<Record<string, unknown>>> => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('resume_builder_token') : null;
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/candidates/${id}/documents`, { method: 'POST', body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
      headers: { 'Content-Type': 'application/json', ...(typeof window !== 'undefined' && window.localStorage.getItem('resume_builder_token') ? { Authorization: `Bearer ${window.localStorage.getItem('resume_builder_token')}` } : {}) },
      body: JSON.stringify({ templateId }),
    }).then(r => r.text()),
};
