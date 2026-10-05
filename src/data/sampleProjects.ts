import { Project } from '../types';
import { SpecEngine } from '../services/generators/specEngine';
import { DatabaseGenerator } from '../services/generators/databaseGenerator';
import { BackendGenerator } from '../services/generators/backendGenerator';
import { AdminGenerator } from '../services/generators/adminGenerator';
import { FlutterGenerator } from '../services/generators/flutterGenerator';
import { DocGenerator } from '../services/generators/docGenerator';

export function createFullProject(prompt: string, appName: string, packageName: string, primaryColor: string, secondaryColor: string): Project {
  const spec = SpecEngine.createSpecification(prompt, {
    appName,
    packageName,
    primaryColor,
    secondaryColor
  });

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

  const id = 'proj_' + packageName.replace(/[^a-z0-9]/g, '_');
  const repoName = appName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return {
    id,
    name: appName,
    packageName,
    description: prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'generated',
    spec,
    files,
    snapshots: [
      {
        id: 'snap_v1',
        version: '1.0.0',
        summary: 'Initial complete generation (Flutter + PHP 8.2 + MySQL + Admin)',
        createdAt: new Date().toISOString(),
        filesCount: Object.keys(files).length
      }
    ],
    builds: [
      {
        id: 'build_initial',
        target: 'apk-release',
        status: 'success',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 14,
        outputFile: `${packageName}-release.apk`,
        fileSizeMb: 24.8,
        logs: [
          { timestamp: '12:00:01', level: 'info', message: 'Resolving Flutter & Android SDK 34...' },
          { timestamp: '12:00:05', level: 'info', message: 'Compiling Dart AOT kernel bytecode...' },
          { timestamp: '12:00:10', level: 'info', message: 'Generating APK signature with release keystore...' },
          { timestamp: '12:00:14', level: 'success', message: 'Successfully generated app-release.apk (24.8 MB)' }
        ],
        autoRepairAttempts: 0,
        repairLogs: []
      }
    ],
    playListing: {
      title: appName,
      shortDescription: `Experience the future of ${appName} on Android. High performance, secure, and intuitive.`,
      fullDescription: `${appName} connects users seamlessly with premium catalogs, direct in-app messaging, verified customer reviews, and multi-gateway payment checkout (Stripe, PayPal). Built for speed and reliability.`,
      privacyPolicyUrl: `https://api.${packageName.split('.')[1] || 'app'}.com/api/pages/privacy-policy`,
      termsUrl: `https://api.${packageName.split('.')[1] || 'app'}.com/api/pages/terms-of-service`,
      contactEmail: `support@${packageName.split('.')[1] || 'app'}.com`,
      appCategory: 'Shopping / Marketplace',
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
      lastSyncCommit: '7f9c2d1',
      lastSyncAt: new Date().toLocaleTimeString(),
      autoSyncOnBuild: false
    },
    gitCommits: [
      {
        sha: '7f9c2d1',
        message: 'feat: initial architecture generation (Flutter 3.22, PHP 8.2 backend, MySQL schema)',
        author: 'AppForge AI Architect',
        date: 'Just now',
        filesCount: Object.keys(files).length,
        url: `https://github.com/appforge-ai/${repoName}/commit/7f9c2d1`
      }
    ]
  };
}

export const initialProjects: Project[] = [
  createFullProject(
    'أريد تطبيقاً لبيع السيارات المستعملة يحتوي على تسجيل المستخدمين، إضافة السيارات، الصور، السعر، الموقع، البحث، الفلاتر، المفضلة، المحادثات، الإشعارات، الدفع عبر Stripe وPayPal، ولوحة تحكم للإدارة.',
    'AutoForge Market',
    'com.appforge.cars',
    '#2563EB',
    '#1D4ED8'
  ),
  createFullProject(
    'تطبيق توصيل طعام للمطاعم والوجبات السريعة مع قوائم الوجبات، السلة، تتبع الطلب، الدفع، الإشعارات الفورية، ولوحة تحكم لإدارة الطلبات والمطابخ.',
    'FastBite Express',
    'com.appforge.food',
    '#EA580C',
    '#C2410C'
  )
];
