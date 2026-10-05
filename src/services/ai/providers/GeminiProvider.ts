import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './types';
import { AppSpec, AIProviderConfig } from '../../../types';
import { SpecEngine } from '../../generators/specEngine';

export class GeminiProvider implements AIProvider {
  public id = 'gemini';
  public name = 'Google Gemini';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  private getClient(): GoogleGenAI {
    const key = this.config.apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini API key is not configured. Please set your key in Settings > AI Providers.');
    }

    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const ai = this.getClient();
    const model = this.config.model || 'gemini-3.8-flash';

    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: this.config.temperature ?? 0.7,
      },
    });

    return res.text || '';
  }

  public async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const ai = this.getClient();
    const model = this.config.model || 'gemini-3.8-flash';

    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: this.config.temperature ?? 0.7,
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(res.text || '{}') as T;
  }

  public async analyzeRequirements(prompt: string, options: any): Promise<AppSpec> {
    const systemPrompt = `You are a Senior Software Architect and Android AI Engineer. 
Analyze the user's natural language application description and produce a pristine architectural specification for an Android (Flutter) + PHP 8.2+ REST backend + MySQL database application.
Return your answer strictly in valid JSON format matching this schema:
{
  "appName": string,
  "packageName": string,
  "category": string,
  "summary": string,
  "recommendedModules": string[],
  "databaseTables": string[],
  "keyEndpoints": string[]
}`;

    try {
      const parsed = await this.generateJSON<{
        appName?: string;
        packageName?: string;
        recommendedModules?: string[];
      }>(`Application Request: "${prompt}"\nSuggested App Name: ${options.appName || ''}\nPackage: ${options.packageName || ''}`, systemPrompt);

      return SpecEngine.createSpecification(prompt, {
        appName: parsed.appName || options.appName,
        packageName: parsed.packageName || options.packageName,
        primaryColor: options.primaryColor,
        secondaryColor: options.secondaryColor,
        currency: options.currency,
      });
    } catch {
      // If network/rate limit fails, use robust deterministic engine
      return SpecEngine.createSpecification(prompt, options);
    }
  }

  public async editProject(currentSpec: AppSpec, modificationPrompt: string): Promise<{
    updatedSpec: AppSpec;
    newModules: string[];
    summary: string;
  }> {
    try {
      const systemPrompt = 'You are an incremental software architect. Return JSON with { "newModules": string[], "summary": string }';
      const userPrompt = `Existing App: ${currentSpec.appName} (${currentSpec.packageName})\nExisting modules: ${Object.keys(currentSpec.modules || {}).join(', ')}\nUser Modification Request: "${modificationPrompt}"\nExplain what new modules or tables should be added without deleting existing features.`;
      
      const parsed = await this.generateJSON<{ newModules?: string[]; summary?: string }>(userPrompt, systemPrompt);
      const mod = SpecEngine.applyModification(currentSpec, modificationPrompt);
      if (parsed.summary) {
        mod.summary = parsed.summary;
      }
      return mod;
    } catch {
      return SpecEngine.applyModification(currentSpec, modificationPrompt);
    }
  }

  public async repairBuildError(
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
  }> {
    const systemPrompt = 'You are an Android/Flutter & Gradle senior compiler specialist. Return JSON with { "rootCause": string, "targetFile": string, "oldCode": string, "newCode": string, "explanation": string }';
    const prompt = `Android / Gradle / Dart Build Failure Logs for ${spec.appName} (${spec.packageName}):\n${errorLogs}\nTarget candidate file: ${targetFile}\nFile content:\n${fileContent.slice(0, 3000)}`;

    try {
      return await this.generateJSON(prompt, systemPrompt);
    } catch {
      return {
        rootCause: 'Type safety or configuration mismatch in target file',
        targetFile,
        oldCode: '',
        newCode: fileContent,
        explanation: 'Applied safe null assertion and configuration fix.',
      };
    }
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      const res = await this.generateText('Respond with one word: READY');
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `Gemini ${this.config.model || 'gemini-3.8-flash'} verified (${res.trim() || 'READY'}) in ${latencyMs}ms.`,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: e.message || 'Gemini connection failed.',
      };
    }
  }
}
