import { Project, BuildRecord, BuildLog, GitSyncCommit, SystemCheckTool, AppSpec, AIProviderConfig } from './index';

export interface GitStatusResult {
  initialized: boolean;
  branch?: string;
  modifiedFiles: string[];
  untrackedFiles: string[];
}

export interface GitOperationResult {
  success: boolean;
  sha?: string;
  message: string;
}

export interface GitHubVerifyResult {
  success: boolean;
  exists: boolean;
  message: string;
  repo?: {
    fullName: string;
    name: string;
    isPrivate: boolean;
    defaultBranch: string;
    htmlUrl: string;
    cloneUrl: string;
    description?: string;
    stars?: number;
  };
}

export interface GitHubCreateResult {
  success: boolean;
  message: string;
  repo?: {
    fullName: string;
    name: string;
    isPrivate: boolean;
    defaultBranch: string;
    htmlUrl: string;
    cloneUrl: string;
  };
}

export interface AIRepairResult {
  rootCause: string;
  targetFile: string;
  oldCode: string;
  newCode: string;
  explanation: string;
}

export interface AppForgeElectronAPI {
  isElectron: boolean;
  platform: string;

  workspace: {
    listProjects: () => Promise<Project[]>;
    getProject: (id: string) => Promise<Project | null>;
    createProject: (projectData: Project) => Promise<string>;
    saveProject: (projectData: Project) => Promise<string>;
    deleteProject: (id: string) => Promise<boolean>;
    cloneProject: (id: string, newName: string) => Promise<Project | null>;
    openInExplorer: (projectPath: string) => Promise<boolean>;
    getWorkspacePath: () => Promise<string>;
    setWorkspacePath: (newPath: string) => Promise<boolean>;
    exportZip: (id: string) => Promise<string>;
  };

  system: {
    detectSdks: () => Promise<SystemCheckTool[]>;
    checkOllama: (baseUrl?: string) => Promise<{ online: boolean; models: string[] }>;
  };

  build: {
    runBuild: (projectId: string, target: 'apk-debug' | 'apk-release' | 'aab') => Promise<BuildRecord>;
    autoRepair: (projectId: string, errorLogs: string) => Promise<AIRepairResult>;
    onBuildLog: (callback: (log: BuildLog) => void) => () => void;
    onBuildProgress: (callback: (progress: { percent: number; step: string }) => void) => () => void;
  };

  git: {
    status: (projectId: string) => Promise<GitStatusResult>;
    init: (projectId: string, branch?: string) => Promise<GitOperationResult>;
    commit: (projectId: string, message: string, authorName?: string, authorEmail?: string) => Promise<GitOperationResult>;
    push: (projectId: string, remoteUrl: string, branch?: string, token?: string) => Promise<GitOperationResult>;
    getLog: (projectId: string, limit?: number) => Promise<GitSyncCommit[]>;
    verifyRepo: (repoOwner: string, repoName: string, token?: string) => Promise<GitHubVerifyResult>;
    createRemoteRepo: (repoName: string, isPrivate: boolean, token: string, description?: string) => Promise<GitHubCreateResult>;
  };

  ai: {
    testConnection: (config: AIProviderConfig) => Promise<{ success: boolean; latencyMs: number; message: string }>;
    analyzeRequirements: (prompt: string, options: any, providerConfig: AIProviderConfig) => Promise<AppSpec>;
    editProject: (currentSpec: AppSpec, prompt: string, providerConfig: AIProviderConfig) => Promise<{ updatedSpec: AppSpec; newModules: string[]; summary: string }>;
    repairError: (spec: AppSpec, errorLogs: string, targetFile: string, providerConfig: AIProviderConfig) => Promise<AIRepairResult>;
  };
}

declare global {
  interface Window {
    appforge?: AppForgeElectronAPI;
  }
}
