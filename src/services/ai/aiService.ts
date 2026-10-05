import { AIProviderConfig, AppSpec } from '../../types';
import { AIProviderFactory } from './providers/AIProviderFactory';

export class AIService {
  /**
   * Tests connection to an AI provider with genuine network handshake and latency measurement
   */
  public static async testProviderConnection(provider: AIProviderConfig): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const instance = AIProviderFactory.getProvider(provider);
    return await instance.testConnection();
  }

  /**
   * Analyzes user prompt using selected AI Provider
   */
  public static async analyzeRequirements(
    prompt: string,
    options: {
      appName?: string;
      packageName?: string;
      primaryColor?: string;
      secondaryColor?: string;
      currency?: string;
      provider?: AIProviderConfig;
    }
  ): Promise<AppSpec> {
    const providerConfig = options.provider || {
      id: 'gemini',
      name: 'Google Gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected',
    };

    const instance = AIProviderFactory.getProvider(providerConfig);
    return await instance.analyzeRequirements(prompt, options);
  }

  /**
   * Edits existing project using AI provider
   */
  public static async editProject(
    currentSpec: AppSpec,
    modificationPrompt: string,
    providerConfig?: AIProviderConfig
  ): Promise<{ updatedSpec: AppSpec; newModules: string[]; summary: string }> {
    const config = providerConfig || {
      id: 'gemini',
      name: 'Google Gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected',
    };

    const instance = AIProviderFactory.getProvider(config);
    return await instance.editProject(currentSpec, modificationPrompt);
  }

  /**
   * Diagnoses compilation error and produces patch
   */
  public static async repairBuildError(
    spec: AppSpec,
    errorLogs: string,
    targetFile: string,
    fileContent: string,
    providerConfig?: AIProviderConfig
  ): Promise<{
    rootCause: string;
    targetFile: string;
    oldCode: string;
    newCode: string;
    explanation: string;
  }> {
    const config = providerConfig || {
      id: 'gemini',
      name: 'Google Gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected',
    };

    const instance = AIProviderFactory.getProvider(config);
    return await instance.repairBuildError(spec, errorLogs, targetFile, fileContent);
  }
}
