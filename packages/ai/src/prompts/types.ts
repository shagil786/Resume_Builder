export interface PromptEntry {
  id: string;
  version: string;
  role: 'system' | 'user';
  content: string;
  description?: string;
}

export interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
}
