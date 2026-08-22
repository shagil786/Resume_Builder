import type { TokenUsage } from '@resume-builder/domain';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokenUsage: TokenUsage;
  model: string;
}

export interface LLMClientConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface JsonSchemaOption {
  name: string;
  schema: Record<string, unknown>;
}

export interface LLMCompleteOptions extends Partial<LLMClientConfig> {
  /** When provided, the client requests strict structured-output mode for this shape. */
  jsonSchema?: JsonSchemaOption;
}

export interface LLMClient {
  complete(messages: LLMMessage[], config?: LLMCompleteOptions): Promise<LLMResponse>;
}

/**
 * Extracts a JSON object from a model response. Handles markdown code
 * fences and leading/trailing prose that models add despite instructions.
 */
export function extractJson(content: string): Record<string, unknown> {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '');

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error('Model returned unparseable JSON');
  }
}
