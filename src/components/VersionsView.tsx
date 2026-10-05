import React, { useState } from 'react';
import { 
  History, 
  GitCommit, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  FileCode, 
  Calendar,
  Layers
} from 'lucide-react';
import { Project, ProjectSnapshot } from '../types';

interface VersionsViewProps {
  project: Project;
  onCreateSnapshot: (summary: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
}

export const VersionsView: React.FC<VersionsViewProps> = ({
  project,
  onCreateSnapshot,
  onRestoreSnapshot
}) => {
  const [snapshotSummary, setSnapshotSummary] = useState('');
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotSummary.trim()) return;
    onCreateSnapshot(snapshotSummary.trim());
    setSnapshotSummary('');
  };

  const handleRestore = (snap: ProjectSnapshot) => {
    onRestoreSnapshot(snap.id);
    setRestoredNotice(`Restored workspace snapshot: V${snap.version} (${snap.summary})`);
    setTimeout(() => setRestoredNotice(null), 3000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Time Travel & Rollback</span>
          <h1 className="text-2xl font-black text-white mt-1">Project Version History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture architectural state snapshots and restore previous generations safely.
          </p>
        </div>
      </div>

      {restoredNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{restoredNotice}</span>
        </div>
      )}

      {/* Create Snapshot Form */}
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
        <input
          type="text"
          value={snapshotSummary}
          onChange={e => setSnapshotSummary(e.target.value)}
          placeholder="Snapshot label (e.g. Added coupons system & tested Stripe payments)..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!snapshotSummary.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Capture Snapshot</span>
        </button>
      </form>

      {/* Snapshot Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Snapshots Timeline ({project.snapshots.length})
        </h3>

        <div className="space-y-3">
          {project.snapshots.map((snap, idx) => (
            <div 
              key={snap.id}
              className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{snap.summary}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                      v{snap.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                    <span>{new Date(snap.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{snap.filesCount} project files</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRestore(snap)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
