import type { PromptEntry } from './types';

const promptRegistry = new Map<string, PromptEntry>();

export function registerPrompt(id: string, entry: PromptEntry): void {
  promptRegistry.set(id, entry);
}

export function getPrompt(id: string): PromptEntry | undefined {
  return promptRegistry.get(id);
}

export function getAllPrompts(): PromptEntry[] {
  return Array.from(promptRegistry.values());
}

export function buildPrompt(id: string, variables: Record<string, string>): string | undefined {
  const entry = promptRegistry.get(id);
  if (!entry) return undefined;

  let content = entry.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
  }
  return content;
}
