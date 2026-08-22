import type { LLMClient, LLMCompleteOptions, JsonSchemaOption, LLMMessage } from './client';
import { extractJson } from './client';

export interface CompleteJsonResult {
  data: Record<string, unknown>;
  tokenUsage: import('./client').LLMResponse['tokenUsage'];
  model: string;
}

/**
 * Completes with strict schema enforcement, extracts the JSON robustly,
 * and retries once (feeding the bad output back) when the first attempt
 * fails to parse or rejects the schema.
 */
export async function completeJson(
  client: LLMClient,
  messages: LLMMessage[],
  options: LLMCompleteOptions & { jsonSchema: JsonSchemaOption },
): Promise<CompleteJsonResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const attemptMessages: LLMMessage[] =
      attempt === 0
        ? messages
        : [
            ...messages,
            { role: 'assistant', content: '…' },
            {
              role: 'user',
              content:
                'Your previous response was not valid JSON matching the required schema. Respond again with ONLY the JSON object. Do not include markdown fences or any text outside the JSON.',
            },
          ];

    try {
      const response = await client.complete(attemptMessages, options);
      const data = extractJson(response.content);
      return { data, tokenUsage: response.tokenUsage, model: response.model };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Structured completion failed after retry');
}
