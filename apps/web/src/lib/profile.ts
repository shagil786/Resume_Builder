import { api } from './api';

export async function getCurrentProfileId(): Promise<{ id?: string; error?: string }> {
  const response = await api.candidates.current();
  if (!response.data) return { error: response.error ?? 'Profile not found' };
  return { id: response.data.id };
}
