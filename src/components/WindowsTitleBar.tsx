import React from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Download, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Smartphone,
  HardDrive,
  FolderGit2
} from 'lucide-react';
import { Project } from '../types';

interface WindowsTitleBarProps {
  activeProject: Project;
  onExportZip: () => void;
  isExporting: boolean;
  systemReady: boolean;
  onNavigate: (view: string) => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  activeProject,
  onExportZip,
  isExporting,
  systemReady,
  onNavigate
}) => {
  return (
    <div className="h-10 bg-slate-950 text-slate-300 border-b border-slate-800 flex items-center justify-between px-3 select-none text-xs shrink-0 z-50">
      {/* Brand & App Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-[10px] shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AppForge AI
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 font-mono">
            v3.2 Enterprise
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Current Active Project Selector Indicator */}
        <button 
          onClick={() => onNavigate('projects')}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-900 transition"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200 max-w-[140px] truncate">{activeProject.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">({activeProject.spec.version})</span>
        </button>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Flutter SDK 3.22</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span>PHP 8.2+ REST</span>
        </div>
        <button 
          onClick={() => onNavigate('git_sync')}
          className="flex items-center gap-1.5 hover:text-indigo-300 transition"
          title="Open GitHub Synchronization"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono">{activeProject.gitConfig?.repoName || 'git'} ({activeProject.gitConfig?.branch || 'main'})</span>
        </button>
      </div>

      {/* Action Buttons & Windows Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('git_sync')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium transition"
          title="GitHub Synchronization Settings"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Git Sync</span>
        </button>

        <button
          onClick={onExportZip}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-sm disabled:opacity-50"
          title="Export complete project ZIP archive (Android, PHP, MySQL, Admin, Docs)"
        >
          <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
          <span>{isExporting ? 'Packaging ZIP...' : 'Export ZIP'}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Windows Standard Window Action Buttons */}
        <div className="flex items-center">
          <button 
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition rounded"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition rounded"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button 
            className="w-7 h-7 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition rounded"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
