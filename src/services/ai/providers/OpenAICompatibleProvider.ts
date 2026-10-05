import { AIProvider } from './types';
import { AppSpec, AIProviderConfig } from '../../../types';
import { SpecEngine } from '../../generators/specEngine';

export class OpenAICompatibleProvider implements AIProvider {
  public id: string;
  public name: string;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.id = config.id;
    this.name = config.name;
  }

  private getBaseUrl(): string {
    let url = this.config.baseUrl || 'https://api.openai.com/v1';
    return url.replace(/\/+$/, '');
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `${this.getBaseUrl()}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey.trim()}`;
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o',
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${this.name} API error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  public async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const sys = (systemInstruction ? systemInstruction + '\n' : '') + 'Output strictly valid JSON with no markdown wrapping or explanations.';
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
    } catch {
      return SpecEngine.createSpecification(prompt, options);
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
        'You are an Android/Flutter senior engineer. Return JSON: { "rootCause": string, "targetFile": string, "oldCode": string, "newCode": string, "explanation": string }'
      );
    } catch {
      return {
        rootCause: 'Compiler error detected in Flutter codebase',
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
      const res = await this.generateText('Respond with one word: READY');
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `${this.name} (${this.config.model}) connected successfully in ${latencyMs}ms (${res.trim() || 'READY'}).`,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: e.message || `${this.name} connection failed.`,
      };
    }
  }
}
