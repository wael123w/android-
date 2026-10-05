import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Code2, 
  FileText,
  Search,
  Wrench,
  Loader2
} from 'lucide-react';
import { Project } from '../types';

interface CodeExplorerViewProps {
  project: Project;
  onModifyProject: (prompt: string) => Promise<void>;
  onExportFile: (path: string, content: string) => void;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({
  project,
  onModifyProject,
  onExportFile
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('database/database.sql');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPatching, setIsPatching] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'database': true,
    'backend': true,
    'admin': true,
    'android': true,
    'docs': false
  });

  const files = project.files;
  const fileKeys = Object.keys(files).sort();

  const filteredFiles = searchQuery.trim()
    ? fileKeys.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
    : fileKeys;

  const currentContent = files[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyAiEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isPatching) return;
    setIsPatching(true);
    try {
      await onModifyProject(aiPrompt);
      setAiPrompt('');
    } finally {
      setIsPatching(false);
    }
  };

  const getLanguageTag = (filename: string) => {
    if (filename.endsWith('.php')) return 'PHP 8.2';
    if (filename.endsWith('.sql')) return 'SQL (MySQL)';
    if (filename.endsWith('.dart')) return 'Dart / Flutter';
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'YAML';
    if (filename.endsWith('.json')) return 'JSON';
    if (filename.endsWith('.xml') || filename.endsWith('.gradle')) return 'Gradle/XML';
    if (filename.endsWith('.md')) return 'Markdown';
    return 'Text';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-100">
      {/* Top AI Modification Bar (Section 16: AI Edit Existing Project) */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between gap-4">
        <form onSubmit={handleApplyAiEdit} className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Project Editor:</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="e.g. أضف نظام كوبونات (Add coupons system) or Require admin approval for listings..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none"
          />
          <button
            type="submit"
            disabled={isPatching || !aiPrompt.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition disabled:opacity-50"
          >
            {isPatching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing delta patch...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" />
                <span>Apply Modification</span>
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 hidden xl:block shrink-0">
          Modifies schema & controllers without deleting existing features
        </div>
      </div>

      {/* Main IDE Workspace: File Tree on Left, Code Editor on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tree Explorer */}
        <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
            {filteredFiles.map(path => {
              const isSelected = selectedFile === path;
              return (
                <button
                  key={path}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{path}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>{Object.keys(files).length} generated files</span>
            <span className="font-mono">UTF-8</span>
          </div>
        </div>

        {/* Center / Right Editor Panel */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-xs shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-white">{selectedFile}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {getLanguageTag(selectedFile)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => onExportFile(selectedFile, currentContent)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-text">
            <pre className="whitespace-pre">{currentContent}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
