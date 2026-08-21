const STORAGE_KEY = 'resume_builder_template_id';
export const DEFAULT_TEMPLATE_ID = 'modern-professional';

export function getSelectedTemplateId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TEMPLATE_ID;
  } catch {
    return DEFAULT_TEMPLATE_ID;
  }
}

export function setSelectedTemplateId(templateId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, templateId);
  } catch {
    /* storage unavailable — selection stays session-only */
  }
}
