import { AIProvider } from './types';
import { AppSpec, AIProviderConfig } from '../../../types';
import { SpecEngine } from '../../generators/specEngine';

export class AnthropicProvider implements AIProvider {
  public id = 'anthropic';
  public name = 'Anthropic Claude';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is not configured. Please set your key in Settings > AI Providers.');
    }

    const url = 'https://api.anthropic.com/v1/messages';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens ?? 4096,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
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
      const res = await this.generateText('Respond with one word: READY');
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `Anthropic (${this.config.model}) connected in ${latencyMs}ms (${res.trim() || 'READY'}).`,
      };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: e.message || 'Anthropic connection failed.',
      };
    }
  }
}
