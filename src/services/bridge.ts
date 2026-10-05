import { Project, BuildRecord, GitConfig, GitSyncCommit, SystemCheckTool } from '../types';

declare global {
  interface Window {
    appforge?: {
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
      };
      system: {
        detectSdks: () => Promise<SystemCheckTool[]>;
        checkOllama: (baseUrl?: string) => Promise<{ online: boolean; models: any[] }>;
      };
      build: {
        runBuild: (projectId: string, target: 'apk-debug' | 'apk-release' | 'aab') => Promise<BuildRecord>;
        autoRepair: (projectId: string, errorLogs: string) => Promise<any>;
        onBuildLog: (callback: (log: any) => void) => () => void;
        onBuildProgress: (callback: (progress: any) => void) => () => void;
      };
      git: {
        status: (projectId: string) => Promise<any>;
        init: (projectId: string, branch?: string) => Promise<any>;
        commit: (projectId: string, message: string, authorName?: string, authorEmail?: string) => Promise<any>;
        push: (projectId: string, remoteUrl: string, branch?: string, token?: string) => Promise<any>;
        getLog: (projectId: string, limit?: number) => Promise<GitSyncCommit[]>;
        verifyRepo: (repoOwner: string, repoName: string, token?: string) => Promise<any>;
        createRemoteRepo: (repoName: string, isPrivate: boolean, token: string, description?: string) => Promise<any>;
      };
    };
  }
}

export class AppBridge {
  public static isElectron(): boolean {
    return Boolean(window.appforge?.isElectron);
  }

  // Workspace Operations
  public static async listProjects(): Promise<Project[]> {
    if (this.isElectron()) {
      return await window.appforge!.workspace.listProjects();
    }
    const res = await fetch('/api/workspace/projects');
    const data = await res.json();
    return data.projects || [];
  }

  public static async saveProject(project: Project): Promise<void> {
    if (this.isElectron()) {
      await window.appforge!.workspace.saveProject(project);
      return;
    }
    await fetch('/api/workspace/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  }

  public static async deleteProject(id: string): Promise<void> {
    if (this.isElectron()) {
      await window.appforge!.workspace.deleteProject(id);
      return;
    }
    await fetch(`/api/workspace/projects/${id}`, { method: 'DELETE' });
  }

  public static async cloneProject(id: string, newName: string): Promise<Project | null> {
    if (this.isElectron()) {
      return await window.appforge!.workspace.cloneProject(id, newName);
    }
    const res = await fetch(`/api/workspace/projects/${id}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName }),
    });
    const data = await res.json();
    return data.project || null;
  }

  // System SDK Detection
  public static async detectSdks(): Promise<SystemCheckTool[]> {
    if (this.isElectron()) {
      return await window.appforge!.system.detectSdks();
    }
    const res = await fetch('/api/system/check');
    const data = await res.json();
    return data.tools || [];
  }

  // Real Build Execution
  public static async runBuild(
    projectId: string,
    target: 'apk-debug' | 'apk-release' | 'aab',
    onLog: (log: any) => void,
    onProgress: (percent: number, step: string) => void
  ): Promise<BuildRecord> {
    if (this.isElectron()) {
      const unsubLog = window.appforge!.build.onBuildLog(onLog);
      const unsubProg = window.appforge!.build.onBuildProgress((p) => onProgress(p.percent, p.step));
      try {
        return await window.appforge!.build.runBuild(projectId, target);
      } finally {
        unsubLog();
        unsubProg();
      }
    }

    // Backend route with Server-Sent Events or POST execution
    onProgress(10, 'Initiating build on workspace server');
    const res = await fetch('/api/build/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, target }),
    });
    const data = await res.json();
    for (const l of data.record?.logs || []) {
      onLog(l);
    }
    onProgress(100, data.record?.status === 'success' ? 'Build Complete' : 'Build Failed');
    return data.record;
  }
}
