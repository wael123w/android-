import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  FileCode, 
  Database, 
  Server, 
  ShieldCheck, 
  Smartphone, 
  Hammer, 
  Wrench, 
  Copy, 
  Check,
  Code
} from 'lucide-react';
import { Project } from '../types';

interface PipelineViewProps {
  project: Project;
  onNavigate: (view: string) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({ project, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'spec' | 'tables' | 'endpoints' | 'screens'>('spec');

  const copySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(project.spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pipelineSteps = [
    { title: 'User Natural Language Prompt', status: 'completed', desc: 'Analyzed semantic requirements and intent' },
    { title: 'Requirement Analyzer', status: 'completed', desc: 'Identified modules (Auth, Commerce, Messaging, Admin, etc.)' },
    { title: 'app-spec.json', status: 'completed', desc: 'Normalized architectural schema produced' },
    { title: 'Database Schema Generator', status: 'completed', desc: `${project.spec.tables.length} MySQL tables, foreign keys, and seed records` },
    { title: 'PHP Backend Generator', status: 'completed', desc: `${project.spec.endpoints.length} REST endpoints, JWT auth, PDO security` },
    { title: 'Admin Panel Planner', status: 'completed', desc: `${project.spec.adminPages.length} CRUD administrative pages & CMS` },
    { title: 'Android UI Planner', status: 'completed', desc: `${project.spec.androidScreens.length} Flutter native widget views with clean architecture` },
    { title: 'Integration & Verification', status: 'completed', desc: 'Full API-Mobile synchronization verified' },
    { title: 'Build & Auto-Repair', status: 'ready', desc: 'Ready for APK/AAB packaging and automated repair' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Architecture Engine</span>
          <h1 className="text-2xl font-black text-white mt-1">AI Requirement & Synthesis Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual inspection of the real multi-stage pipeline converting your prompt into production code.
          </p>
        </div>
        <button
          onClick={copySpec}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied app-spec.json' : 'Copy app-spec.json'}</span>
        </button>
      </div>

      {/* Horizontal Visual Pipeline Tracker */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Pipeline Execution Stages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">Stage 0{idx + 1}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white leading-tight">{step.title}</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specification Inspector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center border-b border-slate-800 px-6 pt-4 gap-4">
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'spec' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            app-spec.json
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'tables' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Database Tables ({project.spec.tables.length})
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'endpoints' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            API Endpoints ({project.spec.endpoints.length})
          </button>
          <button
            onClick={() => setActiveTab('screens')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'screens' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Android Screens ({project.spec.androidScreens.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'spec' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[500px]">
              <pre>{JSON.stringify(project.spec, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {project.spec.tables.map(t => (
                <div key={t.name} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      <span className="font-mono font-bold text-sm text-white">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Module: {t.module}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{t.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    {t.columns.map(c => (
                      <div key={c.name} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-mono text-slate-300 font-bold block">{c.name}</span>
                        <span className="text-slate-500 text-[10px]">{c.type}{c.length ? `(${c.length})` : ''} {c.primaryKey ? '• PK' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-2 max-h-[500px] overflow-y-auto font-mono text-xs">
              {project.spec.endpoints.map((ep, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      ep.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                      ep.method === 'POST' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/50' :
                      ep.method === 'PUT' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                      'bg-rose-950 text-rose-400 border border-rose-800/50'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="text-white font-bold">{ep.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{ep.description}</span>
                    {ep.authRequired && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Auth Guarded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'screens' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {project.spec.androidScreens.map(s => (
                <div key={s.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-white text-xs">{s.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{s.route}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{s.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.widgets.map((w, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
