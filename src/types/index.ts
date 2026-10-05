// AppForge AI Core Type Definitions

export type AIProviderType = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'openrouter' 
  | 'codecraft' 
  | 'ollama' 
  | 'lmstudio' 
  | 'custom';

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isLocal: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastTested?: string;
}

export interface AppSpecModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'commerce' | 'content' | 'social' | 'system';
  tables: string[];
  endpoints: string[];
  screens: string[];
  adminPages: string[];
}

export interface DatabaseColumn {
  name: string;
  type: 'INT' | 'VARCHAR' | 'TEXT' | 'LONGTEXT' | 'DECIMAL' | 'BOOLEAN' | 'TIMESTAMP' | 'DATE' | 'ENUM' | 'JSON';
  length?: string;
  nullable: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface DatabaseTable {
  name: string;
  description: string;
  module: string;
  columns: DatabaseColumn[];
  indexes?: string[];
  sampleRows?: Record<string, any>[];
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  module: string;
  authRequired: boolean;
  roles?: string[];
  parameters?: { name: string; in: 'query' | 'path' | 'header'; type: string; required: boolean }[];
  requestBodySample?: Record<string, any>;
  responseSample?: Record<string, any>;
}

export interface AndroidScreen {
  id: string;
  title: string;
  module: string;
  route: string;
  type: 'list' | 'detail' | 'form' | 'auth' | 'profile' | 'chat' | 'dashboard' | 'custom';
  description: string;
  widgets: string[];
}

export interface AdminPage {
  slug: string;
  title: string;
  module: string;
  icon: string;
  table: string;
  supportsCreate: boolean;
  supportsEdit: boolean;
  supportsDelete: boolean;
  supportsExport: boolean;
  supportsApproval?: boolean;
  searchColumns: string[];
  filterColumns?: string[];
}

export interface AppSpec {
  appName: string;
  packageName: string;
  version: string;
  versionCode: number;
  description: string;
  category: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    darkBackgroundColor: string;
    fontFamily: string;
  };
  backend: {
    type: 'php';
    phpVersion: string;
    databaseType: 'mysql';
    authType: 'jwt';
    uploadStorage: 'local_storage';
    cpanelCompatible: boolean;
  };
  payments: {
    enabled: boolean;
    gateways: ('stripe' | 'paypal' | 'manual')[];
    currency: string;
  };
  modules: Record<string, boolean>;
  tables: DatabaseTable[];
  endpoints: ApiEndpoint[];
  adminPages: AdminPage[];
  androidScreens: AndroidScreen[];
  cmsPages: {
    privacyPolicy: boolean;
    termsAndConditions: boolean;
    aboutUs: boolean;
    contactUs: boolean;
    refundPolicy: boolean;
  };
  apiBaseUrl?: string;
  signing?: {
    keystorePath?: string;
    keyAlias?: string;
    keystorePassword?: string;
    keyPassword?: string;
    isConfigured: boolean;
  };
}

export interface ProjectSnapshot {
  id: string;
  version: string;
  summary: string;
  createdAt: string;
  filesCount: number;
}

export interface BuildLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface BuildRecord {
  id: string;
  projectId?: string;
  target: 'apk-debug' | 'apk-release' | 'aab';
  status: 'idle' | 'building' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  outputFile?: string;
  outputPath?: string;
  fileSizeBytes?: number;
  fileSizeMb?: number;
  logs: BuildLog[];
  error?: string;
  flutterVersion?: string;
  autoRepairAttempts: number;
  repairLogs: string[];
}

export interface GooglePlayListing {
  title: string;
  shortDescription: string;
  fullDescription: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  contactEmail: string;
  appCategory: string;
  contentRating: string;
  containsAds: boolean;
  targetAudience: string[];
}

export interface GitSyncCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
  filesCount?: number;
}

export interface GitConfig {
  enabled: boolean;
  provider: 'github' | 'gitlab' | 'gitea' | 'custom';
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  isPrivate: boolean;
  token?: string;
  authorName: string;
  authorEmail: string;
  lastSyncCommit?: string;
  lastSyncAt?: string;
  autoSyncOnBuild?: boolean;
}

export interface Project {
  id: string;
  name: string;
  packageName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'generated' | 'built';
  spec: AppSpec;
  files: Record<string, string>;
  snapshots: ProjectSnapshot[];
  builds: BuildRecord[];
  playListing: GooglePlayListing;
  gitConfig: GitConfig;
  gitCommits: GitSyncCommit[];
}

export interface SystemCheckTool {
  name: string;
  required: boolean;
  installed: boolean;
  version?: string;
  path?: string;
  description: string;
  installUrl?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'ai' | 'build';
  module: string;
  message: string;
  details?: any;
}
