import { AppSpec, AIProviderConfig } from '../../../types';

export interface AIProviderResponse<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  latencyMs?: number;
}

export interface AIProvider {
  id: string;
  name: string;

  /**
   * Generates raw text response from prompt
   */
  generateText(prompt: string, systemInstruction?: string): Promise<string>;

  /**
   * Generates structured JSON parsed into type T
   */
  generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T>;

  /**
   * Performs real requirement analysis to produce complete AppSpec
   */
  analyzeRequirements(prompt: string, options: any): Promise<AppSpec>;

  /**
   * Performs incremental project edit delta
   */
  editProject(currentSpec: AppSpec, modificationPrompt: string): Promise<{
    updatedSpec: AppSpec;
    newModules: string[];
    summary: string;
  }>;

  /**
   * Diagnoses build error and produces source patch
   */
  repairBuildError(
    spec: AppSpec,
    errorLogs: string,
    targetFile: string,
    fileContent: string
  ): Promise<{
    rootCause: string;
    targetFile: string;
    oldCode: string;
    newCode: string;
    explanation: string;
  }>;

  /**
   * Validates live connection and latency
   */
  testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
