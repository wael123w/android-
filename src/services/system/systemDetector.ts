import { execSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { SystemCheckTool } from '../../types';

export class SystemDetector {
  /**
   * Finds the path of a binary using which or where.exe
   */
  public static findBinaryPath(binaryName: string): string | null {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'where.exe' : 'which';

    try {
      const res = spawnSync(cmd, [binaryName], { encoding: 'utf-8', timeout: 3000 });
      if (res.status === 0 && res.stdout) {
        const firstLine = res.stdout.trim().split(/\r?\n/)[0];
        if (firstLine && fs.existsSync(firstLine)) {
          return firstLine;
        }
      }
    } catch {
      // Not found
    }

    // Check standard Windows directories if on Windows
    if (isWin) {
      const standardWinPaths: Record<string, string[]> = {
        flutter: ['C:\\src\\flutter\\bin\\flutter.bat', 'C:\\flutter\\bin\\flutter.bat'],
        dart: ['C:\\src\\flutter\\bin\\dart.bat', 'C:\\flutter\\bin\\dart.bat'],
        adb: ['%LOCALAPPDATA%\\Android\\Sdk\\platform-tools\\adb.exe'],
        git: ['C:\\Program Files\\Git\\cmd\\git.exe'],
      };

      if (standardWinPaths[binaryName]) {
        for (const p of standardWinPaths[binaryName]) {
          const resolved = p.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
          if (fs.existsSync(resolved)) return resolved;
        }
      }
    }

    return null;
  }

  /**
   * Executes binary to retrieve version string
   */
  public static getBinaryVersion(binaryPath: string, args: string[] = ['--version']): string | null {
    try {
      const res = spawnSync(binaryPath, args, { encoding: 'utf-8', timeout: 4000 });
      const out = (res.stdout || res.stderr || '').trim();
      if (out) {
        const firstLine = out.split(/\r?\n/)[0];
        return firstLine.slice(0, 80);
      }
    } catch {
      // Error running
    }
    return null;
  }

  /**
   * Performs genuine detection of all required and optional toolchains
   */
  public static detectAllSdks(): SystemCheckTool[] {
    const results: SystemCheckTool[] = [];

    // 1. Node.js
    const nodePath = process.execPath;
    const nodeInstalled = fs.existsSync(nodePath);
    results.push({
      name: 'Node.js Runtime',
      required: true,
      installed: nodeInstalled,
      version: process.version,
      path: nodePath,
      description: 'Host desktop runtime environment and package manager',
      installUrl: 'https://nodejs.org'
    });

    // 2. Flutter SDK
    const flutterPath = this.findBinaryPath('flutter');
    const flutterVer = flutterPath ? this.getBinaryVersion(flutterPath, ['--version']) : null;
    results.push({
      name: 'Flutter SDK (Dart 3.2+)',
      required: true,
      installed: Boolean(flutterPath),
      version: flutterVer || (flutterPath ? 'Installed (CLI detected)' : 'Not detected in PATH'),
      path: flutterPath || undefined,
      description: 'Native Android mobile compiler and widget engine',
      installUrl: 'https://docs.flutter.dev/get-started/install'
    });

    // 3. Dart SDK
    const dartPath = this.findBinaryPath('dart') || (flutterPath ? path.join(path.dirname(flutterPath), 'cache', 'dart-sdk', 'bin', process.platform === 'win32' ? 'dart.exe' : 'dart') : null);
    const dartVer = dartPath && fs.existsSync(dartPath) ? this.getBinaryVersion(dartPath, ['--version']) : null;
    results.push({
      name: 'Dart SDK',
      required: true,
      installed: Boolean(dartPath && fs.existsSync(dartPath)),
      version: dartVer || (dartPath ? 'Installed' : 'Missing (bundled with Flutter)'),
      path: dartPath && fs.existsSync(dartPath) ? dartPath : undefined,
      description: 'Type-safe programming language for Flutter',
      installUrl: 'https://dart.dev/get-dart'
    });

    // 4. Java JDK
    const javaPath = this.findBinaryPath('java') || (process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : null);
    const javaVer = javaPath && fs.existsSync(javaPath) ? this.getBinaryVersion(javaPath, ['-version']) : null;
    results.push({
      name: 'Java Development Kit (JDK 17)',
      required: true,
      installed: Boolean(javaPath && fs.existsSync(javaPath)),
      version: javaVer || (javaPath ? 'Installed' : 'Missing (Requires OpenJDK 17)'),
      path: javaPath && fs.existsSync(javaPath) ? javaPath : undefined,
      description: 'Required by Gradle for Android APK compilation',
      installUrl: 'https://adoptium.net'
    });

    // 5. Android SDK & ADB
    const adbPath = this.findBinaryPath('adb');
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    const androidInstalled = Boolean(adbPath || (androidHome && fs.existsSync(androidHome)));
    results.push({
      name: 'Android SDK (API 34)',
      required: true,
      installed: androidInstalled,
      version: adbPath ? (this.getBinaryVersion(adbPath, ['version']) || 'API 34 Ready') : (androidHome ? 'Configured in ANDROID_HOME' : 'Missing Android SDK'),
      path: adbPath || androidHome || undefined,
      description: 'Android platform tools, emulator, and compile target 34',
      installUrl: 'https://developer.android.com/studio'
    });

    // 6. Gradle Build Tool
    const gradlePath = this.findBinaryPath('gradle');
    const gradleVer = gradlePath ? this.getBinaryVersion(gradlePath, ['--version']) : null;
    results.push({
      name: 'Gradle Build Tool',
      required: false,
      installed: Boolean(gradlePath),
      version: gradleVer || (gradlePath ? 'Installed' : 'Automated via Gradle Wrapper (gradlew)'),
      path: gradlePath || undefined,
      description: 'Build automation tool for Android packages',
      installUrl: 'https://gradle.org/install/'
    });

    // 7. Git Version Control
    const gitPath = this.findBinaryPath('git');
    const gitVer = gitPath ? this.getBinaryVersion(gitPath, ['--version']) : null;
    results.push({
      name: 'Git Version Control',
      required: false,
      installed: Boolean(gitPath),
      version: gitVer || (gitPath ? 'Installed' : 'Missing (Install for GitHub sync)'),
      path: gitPath || undefined,
      description: 'Version history, commits, and GitHub repository sync',
      installUrl: 'https://git-scm.com/downloads'
    });

    // 8. PHP Runtime
    const phpPath = this.findBinaryPath('php');
    const phpVer = phpPath ? this.getBinaryVersion(phpPath, ['-v']) : null;
    results.push({
      name: 'PHP 8.2+ CLI Runtime',
      required: false,
      installed: Boolean(phpPath),
      version: phpVer || (phpPath ? 'Installed' : 'Optional local CLI (Backend deploys to cPanel/VPS)'),
      path: phpPath || undefined,
      description: 'Local syntax validator for generated PHP backend files',
      installUrl: 'https://www.php.net/downloads'
    });

    return results;
  }
}
