import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  GitBranch,
  Code2,
  Smartphone,
  ShieldCheck,
  Hammer,
  PlaySquare,
  History,
  FolderGit2,
  Bot,
  Terminal,
  Activity,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  projectsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  projectsCount
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projectsCount },
    { id: 'new_project', label: 'New Project', icon: PlusCircle, highlight: true },
    { id: 'pipeline', label: 'AI Pipeline', icon: GitBranch },
    { id: 'code_explorer', label: 'Code Explorer', icon: Code2 },
    { id: 'device_simulator', label: 'Android Simulator', icon: Smartphone },
    { id: 'admin_preview', label: 'Admin Preview', icon: ShieldCheck },
    { id: 'build_center', label: 'Build & Auto-Repair', icon: Hammer },
    { id: 'git_sync', label: 'GitHub Sync', icon: FolderGit2 },
    { id: 'google_play', label: 'Google Play Kit', icon: PlaySquare },
    { id: 'versions', label: 'Version History', icon: History }
  ];

  const systemNavItems = [
    { id: 'ai_providers', label: 'AI Providers', icon: Bot },
    { id: 'system_check', label: 'System Diagnostics', icon: Activity },
    { id: 'logs', label: 'Logs & Terminal', icon: Terminal },
    { id: 'documentation', label: 'Documentation', icon: BookOpen }
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col shrink-0 select-none text-xs">
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        <div>
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Factory Workflows
          </div>
          <div className="space-y-0.5">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'text-indigo-400 hover:bg-slate-800/80 hover:text-indigo-300'
                      : 'hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Engine & Settings
          </div>
          <div className="space-y-0.5">
            {systemNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Local Engine Active</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">cPanel / VPS</span>
      </div>
    </aside>
  );
};
