import { contextBridge, ipcRenderer } from 'electron';

// Expose safe, typed AppForge desktop APIs to renderer via contextBridge
contextBridge.exposeInMainWorld('appforge', {
  isElectron: true,
  platform: process.platform,

  // Workspace filesystem operations
  workspace: {
    listProjects: () => ipcRenderer.invoke('workspace:listProjects'),
    getProject: (id: string) => ipcRenderer.invoke('workspace:getProject', id),
    createProject: (projectData: any) => ipcRenderer.invoke('workspace:createProject', projectData),
    saveProject: (projectData: any) => ipcRenderer.invoke('workspace:saveProject', projectData),
    deleteProject: (id: string) => ipcRenderer.invoke('workspace:deleteProject', id),
    cloneProject: (id: string, newName: string) => ipcRenderer.invoke('workspace:cloneProject', id, newName),
    openInExplorer: (projectPath: string) => ipcRenderer.invoke('workspace:openInExplorer', projectPath),
    getWorkspacePath: () => ipcRenderer.invoke('workspace:getWorkspacePath'),
    setWorkspacePath: (newPath: string) => ipcRenderer.invoke('workspace:setWorkspacePath', newPath),
    exportZip: (id: string) => ipcRenderer.invoke('workspace:exportZip', id),
  },

  // SDK and System Detection
  system: {
    detectSdks: () => ipcRenderer.invoke('system:detectSdks'),
    checkOllama: (baseUrl?: string) => ipcRenderer.invoke('system:checkOllama', baseUrl),
  },

  // Real Flutter / Android Build Engine
  build: {
    runBuild: (projectId: string, target: 'apk-debug' | 'apk-release' | 'aab') =>
      ipcRenderer.invoke('build:runBuild', { projectId, target }),
    autoRepair: (projectId: string, errorLogs: string) =>
      ipcRenderer.invoke('build:autoRepair', { projectId, errorLogs }),
    onBuildLog: (callback: (log: any) => void) => {
      const listener = (_event: any, log: any) => callback(log);
      ipcRenderer.on('build:log', listener);
      return () => ipcRenderer.removeListener('build:log', listener);
    },
    onBuildProgress: (callback: (progress: any) => void) => {
      const listener = (_event: any, progress: any) => callback(progress);
      ipcRenderer.on('build:progress', listener);
      return () => ipcRenderer.removeListener('build:progress', listener);
    },
  },

  // Real Git Operations
  git: {
    status: (projectId: string) => ipcRenderer.invoke('git:status', projectId),
    init: (projectId: string, branch?: string) => ipcRenderer.invoke('git:init', { projectId, branch }),
    commit: (projectId: string, message: string, authorName?: string, authorEmail?: string) =>
      ipcRenderer.invoke('git:commit', { projectId, message, authorName, authorEmail }),
    push: (projectId: string, remoteUrl: string, branch?: string, token?: string) =>
      ipcRenderer.invoke('git:push', { projectId, remoteUrl, branch, token }),
    getLog: (projectId: string, limit?: number) => ipcRenderer.invoke('git:getLog', { projectId, limit }),
    verifyRepo: (repoOwner: string, repoName: string, token?: string) =>
      ipcRenderer.invoke('git:verifyRepo', { repoOwner, repoName, token }),
    createRemoteRepo: (repoName: string, isPrivate: boolean, token: string, description?: string) =>
      ipcRenderer.invoke('git:createRemoteRepo', { repoName, isPrivate, token, description }),
  },

  // AI Execution
  ai: {
    testConnection: (config: any) => ipcRenderer.invoke('ai:testConnection', config),
    analyzeRequirements: (prompt: string, options: any, providerConfig: any) =>
      ipcRenderer.invoke('ai:analyzeRequirements', { prompt, options, providerConfig }),
    editProject: (currentSpec: any, prompt: string, providerConfig: any) =>
      ipcRenderer.invoke('ai:editProject', { currentSpec, prompt, providerConfig }),
    repairError: (spec: any, errorLogs: string, targetFile: string, providerConfig: any) =>
      ipcRenderer.invoke('ai:repairError', { spec, errorLogs, targetFile, providerConfig }),
  },
});
