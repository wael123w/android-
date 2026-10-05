import React from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Package, 
  Hammer, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Download,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onNavigate: (view: string) => void;
  onExportZip: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNavigate,
  onExportZip
}) => {
  // Compute metrics
  const totalProjects = projects.length;
  let totalSuccessfulBuilds = 0;
  let totalFailedBuilds = 0;
  let totalApkBuilds = 0;
  let totalAabBuilds = 0;

  projects.forEach(p => {
    p.builds.forEach(b => {
      if (b.status === 'success') totalSuccessfulBuilds++;
      if (b.status === 'failed') totalFailedBuilds++;
      if (b.target.includes('apk')) totalApkBuilds++;
      if (b.target === 'aab') totalAabBuilds++;
    });
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Android & PHP Full-Stack Factory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AppForge AI Studio
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Convert natural language prompts into complete native Flutter applications, PHP 8.2+ REST backend, MySQL database schemas, and standalone Admin Panels ready for immediate cPanel or VPS hosting.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('new_project')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Create New Application</span>
            </button>
            <button
              onClick={() => onNavigate('device_simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Launch Device Simulator</span>
            </button>
            <button
              onClick={onExportZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Full ZIP</span>
            </button>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <Hammer className="w-64 h-64 text-indigo-400" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-white">{totalProjects}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active workspaces</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Successful Builds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-400">{totalSuccessfulBuilds}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified compilations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Failed Builds</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-rose-400">{totalFailedBuilds}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Resolved with Auto-Repair</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>APK Builds</span>
            <Smartphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-white">{totalApkBuilds}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Debug & Release APKs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AAB Builds</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-amber-400">{totalAabBuilds}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Google Play Bundles</span>
        </div>
      </div>

      {/* Active Workspace Focus & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Project Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Active Workspace</span>
              <h2 className="text-xl font-bold text-white mt-1">{activeProject.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{activeProject.packageName}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              V{activeProject.spec.version}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Database</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeProject.spec.tables.length} Tables</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">API Endpoints</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeProject.spec.endpoints.length} Routes</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Admin Modules</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeProject.spec.adminPages.length} Pages</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Mobile Screens</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeProject.spec.androidScreens.length} Views</p>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 mb-6">
            <span className="font-semibold text-slate-400 block mb-1">Application Specification Prompt:</span>
            <p className="italic text-slate-300">"{activeProject.description}"</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('pipeline')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              <span>Inspect Architecture Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('code_explorer')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <span>Explore Code & Files</span>
            </button>
            <button
              onClick={() => onNavigate('admin_preview')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Preview</span>
            </button>
          </div>
        </div>

        {/* Recent Workspaces Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Recent Projects</span>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs text-indigo-400 hover:underline font-normal"
            >
              View All ({projects.length})
            </button>
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {projects.map(p => {
              const isSelected = p.id === activeProject.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-700/60'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] text-indigo-400 font-semibold">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{p.packageName}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{Object.keys(p.files).length} files</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('new_project')}
            className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-semibold text-xs transition text-center"
          >
            + Create Another App
          </button>
        </div>
      </div>
    </div>
  );
};
