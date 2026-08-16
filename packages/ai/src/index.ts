import './prompts/definitions';

export { createLLMClient, createAzureOpenAIClient } from './llm';
export type { LLMClient, LLMMessage, LLMResponse, LLMClientConfig } from './llm';

export { JobAnalyzer, ResumeStrategist, ResumeWriter, FactChecker, MatchEvaluator, CoverLetterWriter, ResumeOrchestrator } from './workflows';
export type { MatchEvaluation, OrchestratorConfig, OrchestrationResult, CoverLetterContent } from './workflows';

export { AI_TOOLS } from './tools';
export type {
  AITool,
  GetCandidateProfileInput,
  SearchEvidenceInput,
  SearchEvidenceOutput,
  AnalyzeJobInput,
  GetVerifiedFactInput,
  GetTemplateSchemaInput,
  CalculateResumeFitInput,
  CalculateResumeFitOutput,
  ValidateClaimsInput,
  ValidateClaimsOutput,
} from './tools';

export { getPrompt, getAllPrompts, buildPrompt, registerPrompt } from './prompts';
export type { PromptEntry } from './prompts';
