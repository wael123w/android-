import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Key, 
  Sliders, 
  Sparkles,
  Loader2,
  HardDrive
} from 'lucide-react';
import { AIProviderConfig } from '../types';
import { AIService } from '../services/ai/aiService';

interface ProvidersViewProps {
  providers: AIProviderConfig[];
  activeProviderId: string;
  onSelectActiveProvider: (id: any) => void;
  onUpdateProvider: (provider: AIProviderConfig) => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  providers,
  activeProviderId,
  onSelectActiveProvider,
  onUpdateProvider
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; latencyMs: number; message: string }>>({});
  const [detectingOllama, setDetectingOllama] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  const handleTest = async (provider: AIProviderConfig) => {
    setTestingId(provider.id);
    try {
      const res = await AIService.testProviderConnection(provider);
      setTestResult(prev => ({ ...prev, [provider.id]: res }));
      onUpdateProvider({
        ...provider,
        status: res.success ? 'connected' : 'error',
        lastTested: new Date().toLocaleTimeString()
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleDetectOllama = async () => {
    setDetectingOllama(true);
    try {
      const res = await fetch('/api/ollama/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: 'http://127.0.0.1:11434' })
      });
      const data = await res.json();
      if (data.online && data.models) {
        setOllamaModels(data.models.map((m: any) => m.name));
      } else {
        setOllamaModels(['llama3.2:latest', 'deepseek-coder:6.7b', 'qwen2.5-coder', 'codestral']);
      }
    } catch {
      setOllamaModels(['llama3.2:latest', 'deepseek-coder:6.7b', 'qwen2.5-coder']);
    } finally {
      setDetectingOllama(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Model Orchestration</span>
          <h1 className="text-2xl font-black text-white mt-1">AI Provider Abstraction System</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-provider intelligence: Google Gemini, Local Ollama, OpenAI, Anthropic, OpenRouter, and LM Studio.
          </p>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map(p => {
          const isSelected = p.id === activeProviderId;
          const result = testResult[p.id];
          const isTesting = testingId === p.id;

          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition ${
                isSelected ? 'border-indigo-600 ring-1 ring-indigo-600/50' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      p.isLocal ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/60'
                    }`}>
                      {p.isLocal ? <HardDrive className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.isLocal && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50">
                            Local AI (No Key)
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{p.model}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectActiveProvider(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Active Model' : 'Set as Active'}
                  </button>
                </div>

                {/* Configuration Inputs */}
                <div className="space-y-3 my-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Model Alias</label>
                    <input
                      type="text"
                      value={p.model}
                      onChange={e => onUpdateProvider({ ...p, model: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none"
                    />
                  </div>

                  {p.baseUrl && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Base Endpoint URL</label>
                      <input
                        type="text"
                        value={p.baseUrl}
                        onChange={e => onUpdateProvider({ ...p, baseUrl: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Temperature</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={p.temperature}
                        onChange={e => onUpdateProvider({ ...p, temperature: parseFloat(e.target.value) || 0.7 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Output Tokens</label>
                      <input
                        type="number"
                        value={p.maxTokens}
                        onChange={e => onUpdateProvider({ ...p, maxTokens: parseInt(e.target.value) || 4096 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Special Ollama model auto-detect buttons */}
                  {p.id === 'ollama' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDetectOllama}
                        disabled={detectingOllama}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                      >
                        {detectingOllama ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>Auto-Detect Local Ollama Models</span>
                      </button>

                      {ollamaModels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ollamaModels.map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => onUpdateProvider({ ...p, model: m })}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 font-mono"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Test Button */}
              <div className="border-t border-slate-800/80 pt-4 mt-2">
                {result && (
                  <div className={`p-2.5 rounded-xl text-xs mb-3 flex items-start gap-2 ${
                    result.success ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                  }`}>
                    {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <div>
                      <span className="font-bold block">{result.success ? `Connected (${result.latencyMs}ms)` : 'Connection Error'}</span>
                      <span className="text-[11px] opacity-90">{result.message}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTest(p)}
                  disabled={isTesting}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Test Connection & Handshake</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
