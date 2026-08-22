import type { LLMMessage, LLMResponse } from './client';

export function createAzureOpenAIClient(config: {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion?: string;
}): import('./client').LLMClient {
  const apiVersion = config.apiVersion ?? '2025-04-01-preview';
  const endpoint = config.endpoint.replace(/\/(?:openai\/v1|openai)\/?$/, '');

  return {
    async complete(messages: LLMMessage[], overrides): Promise<LLMResponse> {
      // Per-call model wins (stage-level config), falling back to the
      // client default. On Azure these are deployment names.
      const deployment = overrides?.model ?? config.deployment;
      const requestBody: Record<string, unknown> = {
        messages,
        max_completion_tokens: overrides?.maxTokens ?? 8000,
      };
      if (!deployment.toLowerCase().startsWith('gpt-5')) {
        requestBody.temperature = overrides?.temperature ?? 0.2;
      }
      if (overrides?.jsonSchema) {
        requestBody.response_format = {
          type: 'json_schema',
          json_schema: {
            name: overrides.jsonSchema.name,
            strict: true,
            schema: overrides.jsonSchema.schema,
          },
        };
      } else {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch(
        `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': config.apiKey,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as {
        choices: { message: { content: string } }[];
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        model: string;
      };

      return {
        content: data.choices[0].message.content,
        tokenUsage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
          costEstimate: estimateCost(data.usage.prompt_tokens, data.usage.completion_tokens, data.model),
        },
        model: data.model,
      };
    },
  };
}

function estimateCost(promptTokens: number, completionTokens: number, model: string): number {
  const rates: Record<string, { prompt: number; completion: number }> = {
    'gpt-4-32k': { prompt: 0.06 / 1000, completion: 0.12 / 1000 },
    'gpt-4o': { prompt: 0.005 / 1000, completion: 0.015 / 1000 },
    'gpt-4o-mini': { prompt: 0.00015 / 1000, completion: 0.0006 / 1000 },
  };
  const rate = rates[model] ?? rates['gpt-4o-mini'];
  return (promptTokens * rate.prompt) + (completionTokens * rate.completion);
}
