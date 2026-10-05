import fs from 'fs';
import path from 'path';
import os from 'os';
import { Project, AppSpec } from '../../types';

export class WorkspaceManager {
  private static workspaceDir: string = process.env.APPFORGE_PROJECTS_DIR || path.resolve(process.cwd(), 'AppForgeProjects');

  public static getWorkspaceDir(): string {
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
    return this.workspaceDir;
  }

  public static setWorkspaceDir(dir: string): void {
    this.workspaceDir = path.resolve(dir);
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
  }

  public static getProjectPath(projectId: string): string {
    const dir = this.getWorkspaceDir();
    return path.join(dir, projectId);
  }

  /**
   * Lists all projects stored on real disk
   */
  public static listProjects(): Project[] {
    const root = this.getWorkspaceDir();
    const entries = fs.readdirSync(root, { withFileTypes: true });
    const projects: Project[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projDir = path.join(root, entry.name);
        const metaPath = path.join(projDir, 'appforge.json');
        const specPath = path.join(projDir, 'app-spec.json');

        if (fs.existsSync(metaPath) && fs.existsSync(specPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
            const files = this.readProjectFilesFromDisk(projDir);

            projects.push({
              ...meta,
              spec,
              files,
            });
          } catch (e) {
            console.error(`Error reading project at ${projDir}:`, e);
          }
        }
      }
    }

    return projects;
  }

  /**
   * Reads all project files from disk recursively into a Record<string, string>
   */
  public static readProjectFilesFromDisk(projectDir: string): Record<string, string> {
    const files: Record<string, string> = {};

    const scan = (currentDir: string, relativePath: string = '') => {
      if (!fs.existsSync(currentDir)) return;
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip build outputs and git internal folder from virtual file explorer
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.dart_tool') continue;
        if (entry.name === 'appforge.json' || entry.name === 'app-spec.json') continue;

        const fullPath = path.join(currentDir, entry.name);
        const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scan(fullPath, rel);
        } else if (entry.isFile()) {
          try {
            // Read text files
            const content = fs.readFileSync(fullPath, 'utf-8');
            files[rel] = content;
          } catch {
            // Binary files or skipped
          }
        }
      }
    };

    scan(projectDir);
    return files;
  }

  /**
   * Writes a complete project to real disk
   */
  public static saveProjectToDisk(project: Project): string {
    const projDir = this.getProjectPath(project.id);
    if (!fs.existsSync(projDir)) {
      fs.mkdirSync(projDir, { recursive: true });
    }

    // 1. Write metadata & specification
    const meta = {
      id: project.id,
      name: project.name,
      packageName: project.packageName,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
      status: project.status,
      snapshots: project.snapshots || [],
      builds: project.builds || [],
      playListing: project.playListing,
      gitConfig: project.gitConfig,
      gitCommits: project.gitCommits || [],
      location: projDir,
    };

    fs.writeFileSync(path.join(projDir, 'appforge.json'), JSON.stringify(meta, null, 2), 'utf-8');
    fs.writeFileSync(path.join(projDir, 'app-spec.json'), JSON.stringify(project.spec, null, 2), 'utf-8');

    // 2. Ensure standard directories
    const standardDirs = ['android', 'backend', 'admin', 'database', 'docs', 'build', 'logs'];
    for (const d of standardDirs) {
      const p = path.join(projDir, d);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
      }
    }

    // 3. Write each file to real disk
    for (const [relPath, content] of Object.entries(project.files || {})) {
      const fullPath = path.join(projDir, relPath);
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf-8');
    }

    return projDir;
  }

  /**
   * Deletes a project from disk
   */
  public static deleteProjectFromDisk(projectId: string): boolean {
    const projDir = this.getProjectPath(projectId);
    if (fs.existsSync(projDir)) {
      fs.rmSync(projDir, { recursive: true, force: true });
      return true;
    }
    return false;
  }

  /**
   * Clones a project to a new directory
   */
  public static cloneProjectOnDisk(sourceId: string, newId: string, newName: string): Project | null {
    const sourceDir = this.getProjectPath(sourceId);
    if (!fs.existsSync(sourceDir)) return null;

    const sourceMeta = JSON.parse(fs.readFileSync(path.join(sourceDir, 'appforge.json'), 'utf-8'));
    const sourceSpec = JSON.parse(fs.readFileSync(path.join(sourceDir, 'app-spec.json'), 'utf-8'));
    const sourceFiles = this.readProjectFilesFromDisk(sourceDir);

    const clonedProject: Project = {
      ...sourceMeta,
      id: newId,
      name: newName,
      packageName: sourceMeta.packageName + '.clone',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spec: { ...sourceSpec, appName: newName },
      files: sourceFiles,
    };

    this.saveProjectToDisk(clonedProject);
    return clonedProject;
  }
}
