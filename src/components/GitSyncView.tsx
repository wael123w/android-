import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  Globe, 
  UploadCloud, 
  RefreshCw, 
  Key, 
  Terminal, 
  Eye, 
  EyeOff,
  FolderGit2,
  FileCode,
  ShieldCheck,
  Plus,
  Loader2
} from 'lucide-react';
import { Project, GitConfig, GitSyncCommit } from '../types';
import { GitService } from '../services/git/gitService';

interface GitSyncViewProps {
  project: Project;
  onUpdateGitConfig: (config: GitConfig, newCommit?: GitSyncCommit) => void;
}

export const GitSyncView: React.FC<GitSyncViewProps> = ({
  project,
  onUpdateGitConfig
}) => {
  const [config, setConfig] = useState<GitConfig>(project.gitConfig);
  const [commitMessage, setCommitMessage] = useState('feat: update full-stack Android & PHP architecture');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; message: string; exists?: boolean } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[Git Core] Initialized working tree for ${project.name}`,
    `[Git Remote] origin -> ${project.gitConfig.repoUrl}`,
    `[Git Head] Branch: ${project.gitConfig.branch || 'main'}`
  ]);

  const addTerminalLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGitConfig(config);
    addTerminalLog(`Saved Git repository configuration for ${config.repoOwner}/${config.repoName}`);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyStatus(null);
    addTerminalLog(`Verifying connectivity to GitHub repository https://github.com/${config.repoOwner}/${config.repoName}...`);

    try {
      const res = await GitService.verifyRepository(config);
      setVerifyStatus(res);
      addTerminalLog(res.message);
      if (res.success && res.exists) {
        setConfig(prev => ({
          ...prev,
          repoUrl: res.repo?.cloneUrl || `https://github.com/${config.repoOwner}/${config.repoName}.git`,
          isPrivate: res.repo?.isPrivate ?? prev.isPrivate
        }));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateRemote = async () => {
    if (!config.token) {
      setVerifyStatus({
        success: false,
        message: 'Personal Access Token required to create a new GitHub repository'
      });
      return;
    }

    setIsCreatingRepo(true);
    addTerminalLog(`Sending API request to create ${config.isPrivate ? 'private' : 'public'} GitHub repository: ${config.repoName}...`);

    try {
      const res = await GitService.createRemoteRepository(config, project.description);
      setVerifyStatus(res);
      addTerminalLog(res.message);

      if (res.success && res.repo) {
        const updatedConfig = {
          ...config,
          repoUrl: res.repo.cloneUrl,
          repoOwner: res.repo.fullName.split('/')[0] || config.repoOwner
        };
        setConfig(updatedConfig);
        onUpdateGitConfig(updatedConfig);
      }
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    addTerminalLog(`git add . (${Object.keys(project.files).length} files)`);
    addTerminalLog(`git commit -m "${commitMessage}"`);
    addTerminalLog(`git push origin ${config.branch || 'main'}`);

    try {
      const res = await GitService.pushSync(project, commitMessage);
      addTerminalLog(res.message);

      const updatedConfig = {
        ...config,
        lastSyncCommit: res.commit.sha,
        lastSyncAt: new Date().toLocaleTimeString()
      };
      setConfig(updatedConfig);
      onUpdateGitConfig(updatedConfig, res.commit);
    } finally {
      setIsPushing(false);
    }
  };

  const copyCli = () => {
    navigator.clipboard.writeText(GitService.getCliInstructions(config));
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Version Control & Remote Sync</span>
          <h1 className="text-2xl font-black text-white mt-1">GitHub Repository Synchronization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Link, create, and synchronize your generated Android, PHP, MySQL, and Admin project directly to GitHub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={config.repoUrl.replace('.git', '')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white text-2xl font-bold">
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{config.repoOwner}/{config.repoName}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                config.isPrivate 
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' 
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
              }`}>
                {config.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{config.isPrivate ? 'Private' : 'Public'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 text-indigo-400 border border-slate-800">
                branch: {config.branch || 'main'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">{config.repoUrl}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
              <span>Last commit: <strong className="text-slate-300">{config.lastSyncCommit || 'None'}</strong></span>
              <span>•</span>
              <span>Last synced: <strong className="text-slate-300">{config.lastSyncAt || 'Never'}</strong></span>
              <span>•</span>
              <span>{Object.keys(project.files).length} files tracked</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition disabled:opacity-50"
          >
            {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />}
            <span>Verify Repository</span>
          </button>

          <button
            onClick={handlePush}
            disabled={isPushing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isPushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Commit & Push Now</span>
          </button>
        </div>
      </div>

      {/* Verify Alert / Status Notification */}
      {verifyStatus && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          verifyStatus.success 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
            : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {verifyStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
            <span>{verifyStatus.message}</span>
          </div>

          {!verifyStatus.exists && (
            <button
              onClick={handleCreateRemote}
              disabled={isCreatingRepo || !config.token}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isCreatingRepo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              <span>Create this repo on GitHub</span>
            </button>
          )}
        </div>
      )}

      {/* Grid: Settings on Left, Push & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: GitHub Connection Settings Form */}
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              Repository Link Settings
            </h3>
            <span className="text-[10px] text-slate-500">Configured in Project Settings</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                GitHub Owner / Org
              </label>
              <input
                type="text"
                value={config.repoOwner}
                onChange={e => setConfig({ ...config, repoOwner: e.target.value.trim() })}
                placeholder="e.g. username or organization"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                value={config.repoName}
                onChange={e => setConfig({ ...config, repoName: e.target.value.trim() })}
                placeholder="e.g. my-android-app"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={config.branch}
                onChange={e => setConfig({ ...config, branch: e.target.value.trim() })}
                placeholder="main"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Visibility
              </label>
              <select
                value={config.isPrivate ? 'private' : 'public'}
                onChange={e => setConfig({ ...config, isPrivate: e.target.value === 'private' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="public">Public (Open Source)</option>
                <option value="private">Private (Restricted Access)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                GitHub Personal Access Token (PAT)
              </span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline font-normal text-[10px]"
              >
                Generate Token (repo scope)
              </a>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.token || ''}
                onChange={e => setConfig({ ...config, token: e.target.value.trim() })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Required only for private repositories and automatic remote creation. Token remains securely on local machine.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Author Name</label>
              <input
                type="text"
                value={config.authorName}
                onChange={e => setConfig({ ...config, authorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Author Email</label>
              <input
                type="email"
                value={config.authorEmail}
                onChange={e => setConfig({ ...config, authorEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              Save Git Settings
            </button>
          </div>
        </form>

        {/* Right: Commit & Push Suite + Git Terminal Stream */}
        <div className="space-y-6">
          {/* Commit Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                Commit & Push to Remote
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                {Object.keys(project.files).length} files ready
              </span>
            </h3>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Commit Message</label>
              <input
                type="text"
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                placeholder="e.g. feat: integrate Stripe payments and MySQL migrations"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Files Checklist Preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] uppercase border-b border-slate-800 pb-1 mb-1">
                <span>Staged Paths</span>
                <span>Type</span>
              </div>
              <div className="flex items-center justify-between">
                <span>.gitignore</span>
                <span className="text-indigo-400">git guard</span>
              </div>
              <div className="flex items-center justify-between">
                <span>android/ (Flutter 3.22 App)</span>
                <span className="text-blue-400">dart / java</span>
              </div>
              <div className="flex items-center justify-between">
                <span>backend/ (PHP 8.2 REST API)</span>
                <span className="text-emerald-400">php / jwt</span>
              </div>
              <div className="flex items-center justify-between">
                <span>admin/ (Standalone Dashboard)</span>
                <span className="text-amber-400">php / tailwind</span>
              </div>
              <div className="flex items-center justify-between">
                <span>database/database.sql</span>
                <span className="text-purple-400">mysql 8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>docs/ (11 Technical Guides)</span>
                <span className="text-slate-400">markdown</span>
              </div>
            </div>

            <button
              onClick={handlePush}
              disabled={isPushing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pushing to GitHub origin/{config.branch || 'main'}...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Push Changes to GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Logs & CLI Instructions */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-56">
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono shrink-0">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Git Console & Diagnostics</span>
              </div>

              <button
                onClick={copyCli}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-sans"
              >
                {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCli ? 'Copied CLI script' : 'Copy Local CLI Commands'}</span>
              </button>
            </div>

            <div className="flex-1 p-3 font-mono text-[11px] text-slate-400 overflow-y-auto space-y-1 select-text">
              {terminalLogs.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Commit History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            Repository Commit Log ({project.gitCommits?.length || 0})
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            HEAD -&gt; {config.branch || 'main'}
          </span>
        </h3>

        <div className="divide-y divide-slate-800">
          {(project.gitCommits || []).map((commit, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0 font-mono text-xs">
                  {commit.sha.slice(0, 4)}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">{commit.message}</h5>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span>{commit.date}</span>
                    {commit.filesCount && (
                      <>
                        <span>•</span>
                        <span>{commit.filesCount} files</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/${config.repoOwner}/${config.repoName}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-indigo-400 font-mono text-[11px] border border-slate-800 flex items-center gap-1 transition"
                >
                  <span>{commit.sha}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
