import React from 'react';
import { 
  FolderKanban, 
  Layers, 
  Trash2, 
  Copy, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Smartphone, 
  Server, 
  Database,
  FolderGit2,
  Lock,
  Globe
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCloneProject: (project: Project) => void;
  onNavigate: (view: string) => void;
  onExportZip: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onCloneProject,
  onNavigate,
  onExportZip
}) => {
  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Application Workspaces</span>
          <h1 className="text-2xl font-black text-white mt-1">Managed Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Switch between generated full-stack applications, clone structures, or export packages.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new_project')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(p => {
          const isActive = p.id === activeProjectId;
          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition ${
                isActive ? 'border-indigo-600 ring-1 ring-indigo-600/50' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    {p.spec.category}
                  </span>
                  {isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      Active Workspace
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectProject(p.id)}
                      className="text-xs text-slate-400 hover:text-white font-semibold"
                    >
                      Switch to App
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{p.packageName}</p>
                <p className="text-xs text-slate-300 mt-3 line-clamp-2 italic">"{p.description}"</p>

                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Tables</span>
                    <span className="font-bold text-white text-xs">{p.spec.tables.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Endpoints</span>
                    <span className="font-bold text-white text-xs">{p.spec.endpoints.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Screens</span>
                    <span className="font-bold text-white text-xs">{p.spec.androidScreens.length}</span>
                  </div>
                </div>

                {/* Git Repository Synchronization Info */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-mono text-[11px] text-slate-300 block truncate">
                        {p.gitConfig?.repoOwner}/{p.gitConfig?.repoName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        branch: {p.gitConfig?.branch || 'main'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                    p.gitConfig?.isPrivate
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  }`}>
                    {p.gitConfig?.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                    <span>{p.gitConfig?.isPrivate ? 'Private' : 'Public'}</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectProject(p.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Open Workspace
                  </button>
                  <button
                    onClick={() => {
                      onSelectProject(p.id);
                      onNavigate('git_sync');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-semibold text-xs transition"
                    title="GitHub Repository Sync & Settings"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Git Sync</span>
                  </button>
                  <button
                    onClick={() => onExportZip(p)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Export ZIP"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onCloneProject(p)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Clone Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {projects.length > 1 && (
                  <button
                    onClick={() => onDeleteProject(p.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-950/60 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
