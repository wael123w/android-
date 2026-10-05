import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Server, 
  Database,
  Search
} from 'lucide-react';
import { Project } from '../types';

interface DocsViewProps {
  project: Project;
}

export const DocsView: React.FC<DocsViewProps> = ({ project }) => {
  const [selectedDoc, setSelectedDoc] = useState('README.md');
  const [copied, setCopied] = useState(false);
  const [docSearch, setDocSearch] = useState('');

  const docFiles = Object.keys(project.files)
    .filter(f => f.endsWith('.md'))
    .sort();

  const filteredDocs = docSearch.trim()
    ? docFiles.filter(d => d.toLowerCase().includes(docSearch.toLowerCase()))
    : docFiles;

  const currentDocContent = project.files[selectedDoc] || project.files['README.md'] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDocContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full overflow-hidden text-slate-100">
      {/* Left Documents Selector */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Architecture Specs
          </h2>
          <div className="relative">
            <input
              type="text"
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              placeholder="Filter docs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredDocs.map(doc => {
            const isSelected = selectedDoc === doc;
            return (
              <button
                key={doc}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{doc.replace('docs/', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Document Markdown Viewer */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
        <div className="h-12 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <span className="font-mono font-bold text-white text-xs">{selectedDoc}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Document'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-slate-300 leading-relaxed max-w-4xl select-text">
          <pre className="whitespace-pre-wrap font-sans text-sm">{currentDocContent}</pre>
        </div>
      </div>
    </div>
  );
};
