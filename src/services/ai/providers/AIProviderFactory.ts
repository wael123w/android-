import { AIProviderConfig } from '../../../types';
import { AIProvider } from './types';
import { GeminiProvider } from './GeminiProvider';
import { OpenAICompatibleProvider } from './OpenAICompatibleProvider';
import { OllamaProvider } from './OllamaProvider';
import { AnthropicProvider } from './AnthropicProvider';

export class AIProviderFactory {
  public static getProvider(config: AIProviderConfig): AIProvider {
    switch (config.id) {
      case 'gemini':
        return new GeminiProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'openai':
      case 'openrouter':
      case 'codecraft':
      case 'lmstudio':
      case 'custom':
      default:
        return new OpenAICompatibleProvider(config);
    }
  }
}
