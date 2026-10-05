import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bot, 
  Hammer 
} from 'lucide-react';
import { LogEntry } from '../types';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false;
    if (search.trim() && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.module.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportLogsTxt = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appforge-system-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Observability & Tracing</span>
          <h1 className="text-2xl font-black text-white mt-1">System & Compiler Telemetry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time event stream: AI requirement analyses, compiler passes, and REST backend events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/60 text-xs font-semibold text-slate-300 hover:text-rose-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'info', 'ai', 'build', 'warn', 'error'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filterLevel === lvl ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search log messages..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Logs Terminal Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-y-auto max-h-[500px] space-y-1.5 shadow-2xl select-text">
        {filtered.length === 0 && (
          <span className="text-slate-600 italic">No log entries matching criteria.</span>
        )}
        {filtered.map(l => (
          <div key={l.id} className="flex items-start gap-2 hover:bg-slate-900/40 p-1 rounded">
            <span className="text-slate-600 text-[10px] shrink-0 font-bold">{l.timestamp}</span>
            <span className={`shrink-0 text-[10px] font-bold px-1 rounded ${
              l.level === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
              l.level === 'warn' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
              l.level === 'ai' ? 'bg-purple-950 text-purple-400 border border-purple-800/40' :
              l.level === 'build' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
              'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {l.level.toUpperCase()}
            </span>
            <span className="text-indigo-400 font-bold shrink-0">[{l.module}]</span>
            <span className="text-slate-300">{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
