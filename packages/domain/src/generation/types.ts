export interface GenerationRun {
  id: string;
  profileId: string;
  jobId?: string;
  templateId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  stages: GenerationStageLog[];
  errors?: string[];
}

export interface GenerationStageLog {
  stageName: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  inputRefs?: string[];
  outputRefs?: string[];
  modelVersion?: string;
  promptVersion?: string;
  tokenCount?: TokenUsage;
  error?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimate: number;
}
