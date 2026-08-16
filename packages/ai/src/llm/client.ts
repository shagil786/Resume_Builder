import type { Logger } from '@resume-builder/shared';
import { ConsoleLogger } from '@resume-builder/shared';
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

export interface LLMClient {
  complete(messages: LLMMessage[], config?: Partial<LLMClientConfig>): Promise<LLMResponse>;
}

export function createLLMClient(config: LLMClientConfig, logger?: Logger): LLMClient {
  const log = logger ?? new ConsoleLogger('llm-client');

  return {
    async complete(messages, overrides) {
      const model = overrides?.model ?? config.model;
      const temperature = overrides?.temperature ?? config.temperature ?? 0.2;
      const maxTokens = overrides?.maxTokens ?? config.maxTokens ?? 4000;

      log.info('LLM completion requested', { model, messages: messages.length, temperature, maxTokens });

      const promptTokens = messages.reduce((sum, m) => sum + m.content.length, 0);

      return {
        content: '',
        tokenUsage: {
          promptTokens,
          completionTokens: 0,
          totalTokens: promptTokens,
          costEstimate: 0,
        },
        model,
      };
    },
  };
}
