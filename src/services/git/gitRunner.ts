import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { GitSyncCommit, GitConfig } from '../../types';
import { WorkspaceManager } from '../workspace/workspaceManager';

const execAsync = promisify(exec);

export class GitRunner {
  /**
   * Check if git binary is installed on the operating system
   */
  public static async isGitInstalled(): Promise<{ installed: boolean; version?: string }> {
    try {
      const { stdout } = await execAsync('git --version');
      return { installed: true, version: stdout.trim() };
    } catch {
      return { installed: false };
    }
  }

  /**
   * Initialize git repository in project directory
   */
  public static async initRepo(projectId: string, branch: string = 'main'): Promise<{ success: boolean; message: string }> {
    const projectDir = WorkspaceManager.getProjectPath(projectId);
    if (!fs.existsSync(projectDir)) {
      return { success: false, message: `Project directory not found: ${projectDir}` };
    }

    try {
      await execAsync(`git init -b ${branch}`, { cwd: projectDir });
      return { success: true, message: `Git repository initialized with branch ${branch}` };
    } catch (err: any) {
      // Older git may not support -b flag
      try {
        await execAsync('git init', { cwd: projectDir });
        await execAsync(`git branch -M ${branch}`, { cwd: projectDir });
        return { success: true, message: `Git repository initialized with branch ${branch}` };
      } catch (fallbackErr: any) {
        return { success: false, message: fallbackErr.message || err.message };
      }
    }
  }

  /**
   * Get git status of the project directory
   */
  public static async getStatus(projectId: string): Promise<{
    initialized: boolean;
    branch?: string;
    modifiedFiles: string[];
    untrackedFiles: string[];
  }> {
    const projectDir = WorkspaceManager.getProjectPath(projectId);
    const gitDir = path.join(projectDir, '.git');
    if (!fs.existsSync(gitDir)) {
      return { initialized: false, modifiedFiles: [], untrackedFiles: [] };
    }

    try {
      const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectDir });
      const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: projectDir });

      const modifiedFiles: string[] = [];
      const untrackedFiles: string[] = [];

      for (const line of statusOut.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const code = trimmed.substring(0, 2);
        const file = trimmed.substring(3);
        if (code === '??') {
          untrackedFiles.push(file);
        } else {
          modifiedFiles.push(file);
        }
      }

      return {
        initialized: true,
        branch: branchOut.trim(),
        modifiedFiles,
        untrackedFiles
      };
    } catch {
      return { initialized: true, branch: 'main', modifiedFiles: [], untrackedFiles: [] };
    }
  }

  /**
   * Stage and commit changes in the project directory
   */
  public static async commit(
    projectId: string,
    message: string,
    authorName: string = 'AppForge AI Architect',
    authorEmail: string = 'architect@appforge.local'
  ): Promise<{ success: boolean; sha?: string; message: string }> {
    const projectDir = WorkspaceManager.getProjectPath(projectId);
    const gitDir = path.join(projectDir, '.git');
    if (!fs.existsSync(gitDir)) {
      await this.initRepo(projectId, 'main');
    }

    try {
      await execAsync(`git config user.name "${authorName}"`, { cwd: projectDir });
      await execAsync(`git config user.email "${authorEmail}"`, { cwd: projectDir });
      await execAsync('git add -A', { cwd: projectDir });

      const safeMsg = message.replace(/"/g, '\\"');
      const { stdout } = await execAsync(`git commit -m "${safeMsg}" --allow-empty`, { cwd: projectDir });
      const { stdout: shaOut } = await execAsync('git rev-parse --short HEAD', { cwd: projectDir });
      const sha = shaOut.trim();

      return {
        success: true,
        sha,
        message: `Committed ${sha}: "${message}"`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Git commit failed' };
    }
  }

  /**
   * Push project commits to remote GitHub repository
   */
  public static async push(
    projectId: string,
    remoteUrl: string,
    branch: string = 'main',
    token?: string
  ): Promise<{ success: boolean; sha?: string; message: string }> {
    const projectDir = WorkspaceManager.getProjectPath(projectId);

    try {
      let authedUrl = remoteUrl;
      if (token && remoteUrl.startsWith('https://')) {
        const withoutHttps = remoteUrl.replace('https://', '');
        authedUrl = `https://${token.trim()}@${withoutHttps}`;
      }

      // Check or update remote origin
      try {
        await execAsync(`git remote set-url origin "${authedUrl}"`, { cwd: projectDir });
      } catch {
        await execAsync(`git remote add origin "${authedUrl}"`, { cwd: projectDir });
      }

      await execAsync(`git branch -M ${branch}`, { cwd: projectDir });
      const { stdout } = await execAsync(`git push -u origin ${branch}`, { cwd: projectDir });
      const { stdout: shaOut } = await execAsync('git rev-parse --short HEAD', { cwd: projectDir });
      const sha = shaOut.trim();

      return {
        success: true,
        sha,
        message: `Successfully pushed to origin/${branch} (${sha})`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Git push failed' };
    }
  }

  /**
   * Get git commit history from disk
   */
  public static async getLog(projectId: string, limit: number = 10): Promise<GitSyncCommit[]> {
    const projectDir = WorkspaceManager.getProjectPath(projectId);
    const gitDir = path.join(projectDir, '.git');
    if (!fs.existsSync(gitDir)) return [];

    try {
      const { stdout } = await execAsync(
        `git log -n ${limit} --pretty=format:"%h|%s|%an|%ad" --date=short`,
        { cwd: projectDir }
      );

      const commits: GitSyncCommit[] = [];
      for (const line of stdout.split('\n')) {
        const [sha, message, author, date] = line.split('|');
        if (sha) {
          commits.push({
            sha,
            message: message || '',
            author: author || 'Developer',
            date: date || new Date().toISOString().split('T')[0],
            filesCount: 0
          });
        }
      }
      return commits;
    } catch {
      return [];
    }
  }

  /**
   * Verify repository on GitHub via public/authenticated REST API
   */
  public static async verifyGitHubRepo(repoOwner: string, repoName: string, token?: string): Promise<{
    success: boolean;
    exists: boolean;
    message: string;
    repo?: any;
  }> {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'AppForge-AI-Studio',
        'Accept': 'application/vnd.github.v3+json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`, {
        headers
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          exists: true,
          repo: {
            fullName: data.full_name,
            name: data.name,
            isPrivate: data.private,
            defaultBranch: data.default_branch,
            htmlUrl: data.html_url,
            cloneUrl: data.clone_url,
            description: data.description,
            stars: data.stargazers_count,
            owner: data.owner?.login,
            ownerAvatar: data.owner?.avatar_url,
            permissions: data.permissions
          },
          message: `Verified GitHub repository: ${data.full_name} (${data.private ? 'Private' : 'Public'})`
        };
      } else if (res.status === 404) {
        return {
          success: true,
          exists: false,
          message: `Repository ${repoOwner}/${repoName} does not exist on GitHub yet. You can create it automatically.`
        };
      } else {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          exists: false,
          message: err.message || `GitHub returned status ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        exists: false,
        message: err.message || 'Network error verifying GitHub repository'
      };
    }
  }

  /**
   * Create new repository on GitHub (Public or Private)
   */
  public static async createGitHubRepo(
    repoName: string,
    isPrivate: boolean,
    token: string,
    description?: string
  ): Promise<{ success: boolean; repo?: any; message: string }> {
    try {
      const res = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'User-Agent': 'AppForge-AI-Studio',
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: description || 'Created with AppForge AI — AI Android App Factory',
          private: Boolean(isPrivate),
          auto_init: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          repo: {
            fullName: data.full_name,
            name: data.name,
            isPrivate: data.private,
            defaultBranch: data.default_branch || 'main',
            htmlUrl: data.html_url,
            cloneUrl: data.clone_url
          },
          message: `Created ${data.private ? 'private' : 'public'} GitHub repository: ${data.full_name}`
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to create repository on GitHub'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error communicating with GitHub API'
      };
    }
  }
}
