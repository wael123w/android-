import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { WorkspaceManager } from '../src/services/workspace/workspaceManager';
import { SystemDetector } from '../src/services/system/systemDetector';
import { BuildRunner } from '../src/services/build/buildRunner';
import { AIProviderFactory } from '../src/services/ai/providers/AIProviderFactory';
import { GitRunner } from '../src/services/git/gitRunner';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'AppForge AI — AI Android App Factory',
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // In production load dist/index.html, in dev load dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function setupIpcHandlers() {
  // 1. Workspace Handlers
  ipcMain.handle('workspace:listProjects', async () => {
    return WorkspaceManager.listProjects();
  });

  ipcMain.handle('workspace:getProject', async (_e, id) => {
    const projects = WorkspaceManager.listProjects();
    return projects.find(p => p.id === id) || null;
  });

  ipcMain.handle('workspace:createProject', async (_e, project) => {
    return WorkspaceManager.saveProjectToDisk(project);
  });

  ipcMain.handle('workspace:saveProject', async (_e, project) => {
    return WorkspaceManager.saveProjectToDisk(project);
  });

  ipcMain.handle('workspace:deleteProject', async (_e, id) => {
    return WorkspaceManager.deleteProjectFromDisk(id);
  });

  ipcMain.handle('workspace:cloneProject', async (_e, id, newName) => {
    const newId = 'proj_' + Date.now().toString(36);
    return WorkspaceManager.cloneProjectOnDisk(id, newId, newName);
  });

  ipcMain.handle('workspace:openInExplorer', async (_e, projectPath) => {
    await shell.openPath(projectPath);
    return true;
  });

  ipcMain.handle('workspace:getWorkspacePath', async () => {
    return WorkspaceManager.getWorkspaceDir();
  });

  ipcMain.handle('workspace:setWorkspacePath', async (_e, newPath) => {
    WorkspaceManager.setWorkspaceDir(newPath);
    return true;
  });

  ipcMain.handle('workspace:exportZip', async (_e, projectId) => {
    const zipPath = await WorkspaceManager.exportProjectZip(projectId);
    await shell.showItemInFolder(zipPath);
    return zipPath;
  });

  // 2. System Diagnostics Handlers
  ipcMain.handle('system:detectSdks', async () => {
    return SystemDetector.detectAllSdks();
  });

  ipcMain.handle('system:checkOllama', async (_e, baseUrl) => {
    const url = baseUrl || 'http://127.0.0.1:11434';
    try {
      const res = await fetch(`${url}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        return { online: true, models: data.models || [] };
      }
      return { online: false, models: [] };
    } catch {
      return { online: false, models: [] };
    }
  });

  // 3. Real Build Execution
  ipcMain.handle('build:runBuild', async (_e, { projectId, target }) => {
    if (!mainWindow) throw new Error('Main window not available');

    return await BuildRunner.executeRealBuild(
      projectId,
      target,
      (log) => {
        mainWindow?.webContents.send('build:log', log);
      },
      (percent, step) => {
        mainWindow?.webContents.send('build:progress', { percent, step });
      }
    );
  });

  ipcMain.handle('build:autoRepair', async (_e, { projectId, errorLogs }) => {
    const projects = WorkspaceManager.listProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const provider = AIProviderFactory.getProvider({
      id: 'gemini',
      name: 'Gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected',
    });
    return await provider.repairBuildError(project.spec, errorLogs, 'android/pubspec.yaml', '');
  });

  // 4. Real Git & GitHub Sync Handlers
  ipcMain.handle('git:status', async (_e, projectId) => {
    return await GitRunner.getStatus(projectId);
  });

  ipcMain.handle('git:init', async (_e, { projectId, branch }) => {
    return await GitRunner.initRepo(projectId, branch || 'main');
  });

  ipcMain.handle('git:commit', async (_e, { projectId, message, authorName, authorEmail }) => {
    return await GitRunner.commit(projectId, message, authorName, authorEmail);
  });

  ipcMain.handle('git:push', async (_e, { projectId, remoteUrl, branch, token }) => {
    return await GitRunner.push(projectId, remoteUrl, branch || 'main', token);
  });

  ipcMain.handle('git:getLog', async (_e, { projectId, limit }) => {
    return await GitRunner.getLog(projectId, limit || 10);
  });

  ipcMain.handle('git:verifyRepo', async (_e, { repoOwner, repoName, token }) => {
    return await GitRunner.verifyGitHubRepo(repoOwner, repoName, token);
  });

  ipcMain.handle('git:createRemoteRepo', async (_e, { repoName, isPrivate, token, description }) => {
    return await GitRunner.createGitHubRepo(repoName, isPrivate, token, description);
  });

  // 5. AI Provider Handlers
  ipcMain.handle('ai:testConnection', async (_e, config) => {
    const provider = AIProviderFactory.getProvider(config);
    return await provider.testConnection();
  });

  ipcMain.handle('ai:analyzeRequirements', async (_e, { prompt, options, providerConfig }) => {
    const provider = AIProviderFactory.getProvider(providerConfig);
    return await provider.analyzeRequirements(prompt, options);
  });

  ipcMain.handle('ai:editProject', async (_e, { currentSpec, prompt, providerConfig }) => {
    const provider = AIProviderFactory.getProvider(providerConfig);
    return await provider.editProject(currentSpec, prompt);
  });

  ipcMain.handle('ai:repairError', async (_e, { spec, errorLogs, targetFile, fileContent, providerConfig }) => {
    const provider = AIProviderFactory.getProvider(providerConfig);
    return await provider.repairBuildError(spec, errorLogs, targetFile, fileContent || '');
  });
}
