// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("appforge", {
  isElectron: true,
  platform: process.platform,
  // Workspace filesystem operations
  workspace: {
    listProjects: () => import_electron.ipcRenderer.invoke("workspace:listProjects"),
    getProject: (id) => import_electron.ipcRenderer.invoke("workspace:getProject", id),
    createProject: (projectData) => import_electron.ipcRenderer.invoke("workspace:createProject", projectData),
    saveProject: (projectData) => import_electron.ipcRenderer.invoke("workspace:saveProject", projectData),
    deleteProject: (id) => import_electron.ipcRenderer.invoke("workspace:deleteProject", id),
    cloneProject: (id, newName) => import_electron.ipcRenderer.invoke("workspace:cloneProject", id, newName),
    openInExplorer: (projectPath) => import_electron.ipcRenderer.invoke("workspace:openInExplorer", projectPath),
    getWorkspacePath: () => import_electron.ipcRenderer.invoke("workspace:getWorkspacePath"),
    setWorkspacePath: (newPath) => import_electron.ipcRenderer.invoke("workspace:setWorkspacePath", newPath),
    exportZip: (id) => import_electron.ipcRenderer.invoke("workspace:exportZip", id)
  },
  // SDK and System Detection
  system: {
    detectSdks: () => import_electron.ipcRenderer.invoke("system:detectSdks"),
    checkOllama: (baseUrl) => import_electron.ipcRenderer.invoke("system:checkOllama", baseUrl)
  },
  // Real Flutter / Android Build Engine
  build: {
    runBuild: (projectId, target) => import_electron.ipcRenderer.invoke("build:runBuild", { projectId, target }),
    autoRepair: (projectId, errorLogs) => import_electron.ipcRenderer.invoke("build:autoRepair", { projectId, errorLogs }),
    onBuildLog: (callback) => {
      const listener = (_event, log) => callback(log);
      import_electron.ipcRenderer.on("build:log", listener);
      return () => import_electron.ipcRenderer.removeListener("build:log", listener);
    },
    onBuildProgress: (callback) => {
      const listener = (_event, progress) => callback(progress);
      import_electron.ipcRenderer.on("build:progress", listener);
      return () => import_electron.ipcRenderer.removeListener("build:progress", listener);
    }
  },
  // Real Git Operations
  git: {
    status: (projectId) => import_electron.ipcRenderer.invoke("git:status", projectId),
    init: (projectId, branch) => import_electron.ipcRenderer.invoke("git:init", { projectId, branch }),
    commit: (projectId, message, authorName, authorEmail) => import_electron.ipcRenderer.invoke("git:commit", { projectId, message, authorName, authorEmail }),
    push: (projectId, remoteUrl, branch, token) => import_electron.ipcRenderer.invoke("git:push", { projectId, remoteUrl, branch, token }),
    getLog: (projectId, limit) => import_electron.ipcRenderer.invoke("git:getLog", { projectId, limit }),
    verifyRepo: (repoOwner, repoName, token) => import_electron.ipcRenderer.invoke("git:verifyRepo", { repoOwner, repoName, token }),
    createRemoteRepo: (repoName, isPrivate, token, description) => import_electron.ipcRenderer.invoke("git:createRemoteRepo", { repoName, isPrivate, token, description })
  },
  // AI Execution
  ai: {
    testConnection: (config) => import_electron.ipcRenderer.invoke("ai:testConnection", config),
    analyzeRequirements: (prompt, options, providerConfig) => import_electron.ipcRenderer.invoke("ai:analyzeRequirements", { prompt, options, providerConfig }),
    editProject: (currentSpec, prompt, providerConfig) => import_electron.ipcRenderer.invoke("ai:editProject", { currentSpec, prompt, providerConfig }),
    repairError: (spec, errorLogs, targetFile, providerConfig) => import_electron.ipcRenderer.invoke("ai:repairError", { spec, errorLogs, targetFile, providerConfig })
  }
});
