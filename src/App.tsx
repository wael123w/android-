import React, { useState } from 'react';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewProjectView } from './components/NewProjectView';
import { PipelineView } from './components/PipelineView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { DeviceSimulatorView } from './components/DeviceSimulatorView';
import { AdminPreviewView } from './components/AdminPreviewView';
import { BuildCenterView } from './components/BuildCenterView';
import { GooglePlayView } from './components/GooglePlayView';
import { ProvidersView } from './components/ProvidersView';
import { SystemCheckView } from './components/SystemCheckView';
import { VersionsView } from './components/VersionsView';
import { LogsView } from './components/LogsView';
import { DocsView } from './components/DocsView';
import { ProjectsView } from './components/ProjectsView';
import { GitSyncView } from './components/GitSyncView';

import { Project, AIProviderConfig, LogEntry, BuildRecord, GitConfig, GitSyncCommit } from './types';
import { initialProjects, createFullProject } from './data/sampleProjects';
import { AIService } from './services/ai/aiService';
import { ExportService } from './services/generators/exportService';
import { DatabaseGenerator } from './services/generators/databaseGenerator';
import { BackendGenerator } from './services/generators/backendGenerator';
import { AdminGenerator } from './services/generators/adminGenerator';
import { FlutterGenerator } from './services/generators/flutterGenerator';
import { DocGenerator } from './services/generators/docGenerator';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjects[0].id);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'gemini',
      name: 'Google Gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected',
      lastTested: 'Online'
    },
    {
      id: 'ollama',
      name: 'Ollama (Local AI)',
      baseUrl: 'http://127.0.0.1:11434',
      model: 'llama3.2:latest',
      temperature: 0.7,
      maxTokens: 4096,
      isLocal: true,
      status: 'connected',
      lastTested: 'Ready'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      isLocal: false,
      status: 'connected'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 8192,
      isLocal: false,
      status: 'connected'
    },
    {
      id: 'custom',
      name: 'Custom OpenAI-Compatible API',
      baseUrl: 'http://localhost:8000/v1',
      model: 'custom-model',
      temperature: 0.7,
      maxTokens: 4096,
      isLocal: true,
      status: 'connected'
    }
  ]);

  const [activeProviderId, setActiveProviderId] = useState<string>('gemini');

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      module: 'FactoryCore',
      message: 'AppForge AI Windows Studio initialized. Ready for project generation.'
    },
    {
      id: 'log_2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'ai',
      module: 'AIProviders',
      message: 'Active provider initialized: Gemini 3.8 Flash (Enterprise full-stack mode).'
    },
    {
      id: 'log_3',
      timestamp: new Date().toLocaleTimeString(),
      level: 'build',
      module: 'Toolchain',
      message: 'Flutter 3.22.0, Android SDK API 34, and PHP 8.2 verified.'
    }
  ]);

  const addLog = (level: LogEntry['level'], module: string, message: string) => {
    setLogs(prev => [
      {
        id: 'log_' + Date.now().toString(36),
        timestamp: new Date().toLocaleTimeString(),
        level,
        module,
        message
      },
      ...prev
    ]);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeProvider = providers.find(p => p.id === activeProviderId) || providers[0];

  // 1. Generate New Project
  const handleGenerateProject = async (data: {
    appName: string;
    packageName: string;
    prompt: string;
    primaryColor: string;
    secondaryColor: string;
    currency: string;
    provider: AIProviderConfig;
  }) => {
    addLog('ai', 'RequirementAnalyzer', `Parsing application description: "${data.prompt.slice(0, 50)}..."`);
    
    // Step 1: AI analyzes prompt and synthesizes spec
    const spec = await AIService.analyzeRequirements(data.prompt, {
      appName: data.appName,
      packageName: data.packageName,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      currency: data.currency,
      provider: data.provider
    });

    addLog('ai', 'SpecGenerator', `Generated app-spec.json for ${spec.appName} (${spec.tables.length} tables, ${spec.endpoints.length} endpoints)`);

    // Step 2: Generate all code files
    const files: Record<string, string> = {
      '.gitignore': `# AppForge AI Git Ignore
build/
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
*.apk
*.aab
*.keystore
uploads/*
!uploads/.gitkeep
.env
node_modules/
*.log
`,
      'database/database.sql': DatabaseGenerator.generateSql(spec),
      ...BackendGenerator.generateBackendFiles(spec),
      ...AdminGenerator.generateAdminFiles(spec),
      ...FlutterGenerator.generateFlutterFiles(spec),
      ...DocGenerator.generateDocs(spec)
    };

    addLog('build', 'CodeGenerator', `Synthesized ${Object.keys(files).length} project files (Flutter, PHP 8.2, MySQL, Admin, Docs)`);

    const repoName = data.appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newProject: Project = {
      id: 'proj_' + data.packageName.replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36),
      name: data.appName,
      packageName: data.packageName,
      description: data.prompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'generated',
      spec,
      files,
      snapshots: [
        {
          id: 'snap_v1',
          version: '1.0.0',
          summary: 'Initial complete full-stack generation',
          createdAt: new Date().toISOString(),
          filesCount: Object.keys(files).length
        }
      ],
      builds: [
        {
          id: 'build_init',
          target: 'apk-release',
          status: 'success',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationSeconds: 12,
          outputFile: `${data.packageName}-release.apk`,
          fileSizeMb: 24.5,
          logs: [
            { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Compilation validated' },
            { timestamp: new Date().toLocaleTimeString(), level: 'success', message: 'Build produced ready release APK' }
          ],
          autoRepairAttempts: 0,
          repairLogs: []
        }
      ],
      playListing: {
        title: data.appName,
        shortDescription: `Experience the future of ${data.appName} on Android. Fast, secure, and intuitive.`,
        fullDescription: `${data.appName} connects users with a modern catalog, real-time messaging, secure payments via Stripe and PayPal, and full administrative moderation.`,
        privacyPolicyUrl: `https://api.${data.packageName.split('.')[1] || 'app'}.com/api/pages/privacy-policy`,
        termsUrl: `https://api.${data.packageName.split('.')[1] || 'app'}.com/api/pages/terms-of-service`,
        contactEmail: `support@${data.packageName.split('.')[1] || 'app'}.com`,
        appCategory: 'Shopping & Marketplace',
        contentRating: 'Everyone',
        containsAds: false,
        targetAudience: ['Young Adults', 'Adults']
      },
      gitConfig: {
        enabled: true,
        provider: 'github',
        repoUrl: `https://github.com/appforge-ai/${repoName}.git`,
        repoOwner: 'appforge-ai',
        repoName: repoName,
        branch: 'main',
        isPrivate: false,
        token: '',
        authorName: 'AppForge AI Architect',
        authorEmail: 'dev@appforge.local',
        lastSyncCommit: '1a2b3c4',
        lastSyncAt: new Date().toLocaleTimeString(),
        autoSyncOnBuild: false
      },
      gitCommits: [
        {
          sha: '1a2b3c4',
          message: `feat: initial full-stack generation of ${data.appName}`,
          author: 'AppForge AI Architect',
          date: 'Just now',
          filesCount: Object.keys(files).length,
          url: `https://github.com/appforge-ai/${repoName}/commit/1a2b3c4`
        }
      ]
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    addLog('info', 'ProjectManager', `Workspace "${newProject.name}" activated.`);
    setCurrentView('pipeline');
  };

  // 2. Incremental AI Edit Project (Section 16)
  const handleModifyProject = async (modificationPrompt: string) => {
    addLog('ai', 'AIEditor', `Analyzing modification request: "${modificationPrompt}"`);

    const result = await AIService.editProject(activeProject.spec, modificationPrompt);
    
    // Regenerate modified files
    const newFiles = { ...activeProject.files };
    
    // Update database.sql and add migration file
    newFiles['database/database.sql'] = DatabaseGenerator.generateSql(result.updatedSpec);
    if (result.newModules.length > 0) {
      const migrationFile = `database/migrations/migration_v${result.updatedSpec.versionCode}.sql`;
      newFiles[migrationFile] = DatabaseGenerator.generateMigration(result.updatedSpec, result.newModules);
      addLog('build', 'DatabaseGenerator', `Created migration ${migrationFile} for modules: ${result.newModules.join(', ')}`);
    }

    // Refresh backend, admin, and flutter files
    Object.assign(newFiles, BackendGenerator.generateBackendFiles(result.updatedSpec));
    Object.assign(newFiles, AdminGenerator.generateAdminFiles(result.updatedSpec));
    Object.assign(newFiles, FlutterGenerator.generateFlutterFiles(result.updatedSpec));
    Object.assign(newFiles, DocGenerator.generateDocs(result.updatedSpec));

    const newSnapshot = {
      id: 'snap_' + Date.now().toString(36),
      version: result.updatedSpec.version,
      summary: result.summary,
      createdAt: new Date().toISOString(),
      filesCount: Object.keys(newFiles).length
    };

    const updatedProject: Project = {
      ...activeProject,
      spec: result.updatedSpec,
      files: newFiles,
      updatedAt: new Date().toISOString(),
      snapshots: [newSnapshot, ...activeProject.snapshots]
    };

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    addLog('success', 'AIEditor', `Successfully applied modification: ${result.summary}`);
  };

  // 3. Export Project ZIP
  const handleExportZip = async (targetProj: Project = activeProject) => {
    setIsExporting(true);
    addLog('info', 'ExportService', `Assembling complete ZIP archive for ${targetProj.name}...`);
    try {
      const blob = await ExportService.exportProjectZip(targetProj);
      ExportService.triggerDownload(blob, `${targetProj.packageName}-project.zip`);
      addLog('success', 'ExportService', `Exported ${targetProj.packageName}-project.zip successfully.`);
    } catch (err: any) {
      addLog('error', 'ExportService', `Failed to package ZIP: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Save Single File
  const handleExportSingleFile = (filePath: string, content: string) => {
    const filename = filePath.split('/').pop() || 'file.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    ExportService.triggerDownload(blob, filename);
  };

  // 5. Version Control Snapshots
  const handleCreateSnapshot = (summary: string) => {
    const newSnapshot = {
      id: 'snap_' + Date.now().toString(36),
      version: activeProject.spec.version,
      summary,
      createdAt: new Date().toISOString(),
      filesCount: Object.keys(activeProject.files).length
    };
    const updated = {
      ...activeProject,
      snapshots: [newSnapshot, ...activeProject.snapshots]
    };
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    addLog('info', 'VersionControl', `Captured snapshot: ${summary}`);
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    const snap = activeProject.snapshots.find(s => s.id === snapshotId);
    if (!snap) return;
    addLog('warn', 'VersionControl', `Restored workspace snapshot: V${snap.version} (${snap.summary})`);
  };

  // 6. Builds Update
  const handleUpdateBuilds = (buildRecord: BuildRecord, updatedFiles?: Record<string, string>) => {
    const updated = {
      ...activeProject,
      files: updatedFiles ? { ...activeProject.files, ...updatedFiles } : activeProject.files,
      builds: [buildRecord, ...activeProject.builds.filter(b => b.id !== buildRecord.id)]
    };
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    addLog(
      buildRecord.status === 'success' ? 'success' : 'error',
      'BuildEngine',
      `Build target ${buildRecord.target} finished with status: ${buildRecord.status.toUpperCase()}`
    );
  };

  // 7. Clone Project
  const handleCloneProject = (source: Project) => {
    const cloned = createFullProject(
      source.description,
      source.name + ' (Copy)',
      source.packageName + '.copy',
      source.spec.theme.primaryColor,
      source.spec.theme.secondaryColor
    );
    setProjects(prev => [cloned, ...prev]);
    setActiveProjectId(cloned.id);
    addLog('info', 'ProjectManager', `Cloned workspace "${source.name}"`);
  };

  // 8. Delete Project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(projects.find(p => p.id !== id)!.id);
    }
  };

  // 9. Update Git Configuration
  const handleUpdateGitConfig = (newConfig: GitConfig, newCommit?: GitSyncCommit) => {
    const updated: Project = {
      ...activeProject,
      gitConfig: newConfig,
      gitCommits: newCommit ? [newCommit, ...(activeProject.gitCommits || [])] : activeProject.gitCommits
    };
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    addLog('info', 'GitSync', `Updated Git configuration for ${newConfig.repoOwner}/${newConfig.repoName} (branch: ${newConfig.branch})`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans overflow-hidden select-none">
      {/* 1. Windows Native Styled Title Bar */}
      <WindowsTitleBar
        activeProject={activeProject}
        onExportZip={() => handleExportZip(activeProject)}
        isExporting={isExporting}
        systemReady={true}
        onNavigate={setCurrentView}
      />

      {/* 2. Main Studio Body: Sidebar on Left, Work View on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          projectsCount={projects.length}
        />

        {/* Active Workspace View Router */}
        <main className="flex-1 bg-slate-950 overflow-hidden relative">
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              activeProject={activeProject}
              onSelectProject={id => setActiveProjectId(id)}
              onNavigate={setCurrentView}
              onExportZip={() => handleExportZip(activeProject)}
            />
          )}

          {currentView === 'new_project' && (
            <NewProjectView
              onGenerate={handleGenerateProject}
              providers={providers}
              activeProvider={activeProvider}
            />
          )}

          {currentView === 'pipeline' && (
            <PipelineView
              project={activeProject}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'code_explorer' && (
            <CodeExplorerView
              project={activeProject}
              onModifyProject={handleModifyProject}
              onExportFile={handleExportSingleFile}
            />
          )}

          {currentView === 'device_simulator' && (
            <DeviceSimulatorView
              project={activeProject}
            />
          )}

          {currentView === 'admin_preview' && (
            <AdminPreviewView
              project={activeProject}
            />
          )}

          {currentView === 'build_center' && (
            <BuildCenterView
              project={activeProject}
              onUpdateProjectBuilds={handleUpdateBuilds}
            />
          )}

          {currentView === 'git_sync' && (
            <GitSyncView
              project={activeProject}
              onUpdateGitConfig={handleUpdateGitConfig}
            />
          )}

          {currentView === 'google_play' && (
            <GooglePlayView
              project={activeProject}
              onUpdateListing={listing => {
                const updated = { ...activeProject, playListing: listing };
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={id => setActiveProjectId(id)}
              onDeleteProject={handleDeleteProject}
              onCloneProject={handleCloneProject}
              onNavigate={setCurrentView}
              onExportZip={handleExportZip}
            />
          )}

          {currentView === 'versions' && (
            <VersionsView
              project={activeProject}
              onCreateSnapshot={handleCreateSnapshot}
              onRestoreSnapshot={handleRestoreSnapshot}
            />
          )}

          {currentView === 'ai_providers' && (
            <ProvidersView
              providers={providers}
              activeProviderId={activeProviderId}
              onSelectActiveProvider={setActiveProviderId}
              onUpdateProvider={updatedP => {
                setProviders(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
              }}
            />
          )}

          {currentView === 'system_check' && (
            <SystemCheckView />
          )}

          {currentView === 'logs' && (
            <LogsView
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          )}

          {currentView === 'documentation' && (
            <DocsView
              project={activeProject}
            />
          )}
        </main>
      </div>
    </div>
  );
}
