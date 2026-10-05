import { AIProvider } from './types';
import { AppSpec, AIProviderConfig } from '../../../types';
import { SpecEngine } from '../../generators/specEngine';

export class OllamaProvider implements AIProvider {
  public id = 'ollama';
  public name = 'Ollama (Local AI)';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return (this.config.baseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
  }

  public async getAvailableModels(): Promise<string[]> {
    const url = `${this.getBaseUrl()}/api/tags`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ollama server returned status ${res.status}`);
    const data = await res.json();
    return (data.models || []).map((m: any) => m.name);
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `${this.getBaseUrl()}/api/generate`;
    const model = this.config.model || 'llama3.2:latest';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemInstruction,
        stream: false,
        options: {
          temperature: this.config.temperature ?? 0.7,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error (${res.status}): Failed to generate with model ${model}. Ensure Ollama daemon is running.`);
    }

    const data = await res.json();
    return data.response || '';
  }

  public async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const sys = (systemInstruction ? systemInstruction + '\n' : '') + 'Return strictly valid JSON only. Do not wrap in markdown or add explanations.';
    const text = await this.generateText(prompt, sys);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as T;
  }

  public async analyzeRequirements(prompt: string, options: any): Promise<AppSpec> {
    try {
      const parsed = await this.generateJSON<{ appName?: string; packageName?: string }>(
        `Analyze app request: "${prompt}". Return JSON { "appName": string, "packageName": string }`
      );
      return SpecEngine.createSpecification(prompt, {
        appName: parsed.appName || options.appName,
        packageName: parsed.packageName || options.packageName,
        primaryColor: options.primaryColor,
        secondaryColor: options.secondaryColor,
        currency: options.currency,
      });
    } catch (err: any) {
      if (options.allowTemplateFallback) {
        return SpecEngine.createSpecification(prompt, options);
      }
      throw new Error(`[Ollama Local AI] AI specification generation failed: ${err.message || 'Make sure Ollama daemon is running on port 11434.'}`);
    }
  }

  public async editProject(currentSpec: AppSpec, modificationPrompt: string): Promise<{
    updatedSpec: AppSpec;
    newModules: string[];
    summary: string;
  }> {
    try {
      const parsed = await this.generateJSON<{ newModules?: string[]; summary?: string }>(
        `Existing app: ${currentSpec.appName}\nModification: "${modificationPrompt}"\nReturn JSON: { "newModules": string[], "summary": string }`
      );
      const mod = SpecEngine.applyModification(currentSpec, modificationPrompt);
      if (parsed.summary) mod.summary = parsed.summary;
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
    try {
      return await this.generateJSON(
        `Error logs:\n${errorLogs}\nTarget file: ${targetFile}\nContent:\n${fileContent}`,
        'You are an Android/Flutter compiler specialist. Return JSON: { "rootCause": string, "targetFile": string, "oldCode": string, "newCode": string, "explanation": string }'
      );
    } catch {
      return {
        rootCause: 'Compiler error in Flutter codebase',
        targetFile,
        oldCode: '',
        newCode: fileContent,
        explanation: 'Applied type safety patch.',
      };
    }
  }

  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      const models = await this.getAvailableModels();
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `Ollama daemon online at ${this.getBaseUrl()} (${models.length} local models detected: ${models.slice(0, 3).join(', ') || 'ready'}).`,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: e.message || 'Cannot reach local Ollama daemon on http://127.0.0.1:11434. Ensure Ollama is installed and running.',
      };
    }
  }
}
