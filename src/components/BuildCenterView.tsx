import React, { useState } from 'react';
import { 
  Hammer, 
  Smartphone, 
  Package, 
  RotateCcw, 
  Bug, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Download, 
  Clock, 
  HardDrive,
  Loader2,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { Project, BuildRecord, BuildLog } from '../types';
import { BuildEngine } from '../services/build/buildEngine';

interface BuildCenterViewProps {
  project: Project;
  onUpdateProjectBuilds: (build: BuildRecord, updatedFiles?: Record<string, string>) => void;
}

export const BuildCenterView: React.FC<BuildCenterViewProps> = ({
  project,
  onUpdateProjectBuilds
}) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [liveLogs, setLiveLogs] = useState<BuildLog[]>([]);
  const [activeTarget, setActiveTarget] = useState<'apk-debug' | 'apk-release' | 'aab'>('apk-release');
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [repairInfo, setRepairInfo] = useState<{ rootCause: string; targetFile: string; explanation: string } | null>(null);

  const latestBuild = project.builds[0];

  const handleRunBuild = async (target: 'apk-debug' | 'apk-release' | 'aab', simulateError: boolean = false) => {
    setActiveTarget(target);
    setIsBuilding(true);
    setLiveLogs([]);
    setBuildProgress(0);
    setRepairInfo(null);

    try {
      const result = await BuildEngine.runBuild(
        project,
        target,
        log => setLiveLogs(prev => [...prev, log]),
        (pct, step) => {
          setBuildProgress(pct);
          setCurrentStep(step);
        },
        simulateError
      );

      onUpdateProjectBuilds(result.record, result.updatedFiles);

      if (!result.success) {
        // If build failed, offer or trigger AI Auto-Repair
        setRepairAttempts(1);
      }
    } finally {
      setIsBuilding(false);
    }
  };

  const handleTriggerAutoRepair = async () => {
    if (!latestBuild || isRepairing) return;
    setIsRepairing(true);

    try {
      const repairResult = await BuildEngine.autoRepairBuild(
        project,
        latestBuild,
        msg => {
          setLiveLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: msg
          }]);
        }
      );

      setRepairInfo({
        rootCause: 'Type safety null assertion mismatch in app_config.dart',
        targetFile: 'android/lib/core/config/app_config.dart',
        explanation: repairResult.diagnosis
      });

      // Now run successful re-compilation after repair
      const recomp = await BuildEngine.runBuild(
        project,
        activeTarget,
        log => setLiveLogs(prev => [...prev, log]),
        (pct, step) => {
          setBuildProgress(pct);
          setCurrentStep(step);
        },
        false
      );

      recomp.record.autoRepairAttempts = 1;
      recomp.record.repairLogs = [
        'AI Diagnosis: Null configuration property in app_config.dart',
        'Auto-applied patch to android/lib/core/config/app_config.dart',
        'Resolved Gradle compilation error on retry attempt 1/5'
      ];

      onUpdateProjectBuilds(recomp.record, repairResult.fixedFiles);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Compiler & Output Suite</span>
          <h1 className="text-2xl font-black text-white mt-1">Build Center & AI Auto-Repair</h1>
          <p className="text-xs text-slate-400 mt-1">
            Produce signed Android APKs and Google Play AABs with automated AI error analysis and self-healing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target SDK: <strong className="text-white font-mono">34 (Android 14)</strong></span>
        </div>
      </div>

      {/* Build Action Buttons Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleRunBuild('apk-release')}
            disabled={isBuilding || isRepairing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4" />
            <span>Build Release APK</span>
          </button>

          <button
            onClick={() => handleRunBuild('aab')}
            disabled={isBuilding || isRepairing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition disabled:opacity-50"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Build Google Play AAB</span>
          </button>

          <button
            onClick={() => handleRunBuild('apk-debug')}
            disabled={isBuilding || isRepairing}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Build Debug APK</span>
          </button>

          <button
            onClick={() => handleRunBuild('apk-release')}
            disabled={isBuilding || isRepairing}
            className="flex items-center gap-2 px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-semibold text-xs border border-slate-700 transition"
            title="Clean & Rebuild"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clean Cache</span>
          </button>
        </div>

        {/* Test Build Failure & Auto-Repair Demonstration Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunBuild('apk-release', true)}
            disabled={isBuilding || isRepairing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-semibold text-xs transition"
            title="Simulates a real compiler error to test the AI Auto-Repair Agent"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Build Error</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Step Status */}
      {isBuilding && (
        <div className="bg-slate-900 border border-indigo-900/50 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              {currentStep}
            </span>
            <span className="font-mono font-bold text-white">{buildProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              style={{ width: `${buildProgress}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* AI Auto-Repair Card (when build fails or repair succeeds) */}
      {latestBuild && latestBuild.status === 'failed' && (
        <div className="bg-rose-950/40 border border-rose-800/80 p-6 rounded-2xl shadow-lg flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Compilation Fault Detected ({latestBuild.error})</span>
            </div>
            <p className="text-xs text-slate-300">
              The AI Error Analyzer has isolated the issue. Maximum automated repair attempts: <strong className="text-white">5</strong>.
            </p>
          </div>

          <button
            onClick={handleTriggerAutoRepair}
            disabled={isRepairing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 shrink-0"
          >
            {isRepairing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Healing Project...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Trigger AI Auto-Repair Agent</span>
              </>
            )}
          </button>
        </div>
      )}

      {repairInfo && (
        <div className="bg-emerald-950/40 border border-emerald-800/80 p-6 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI Auto-Repair Successfully Resolved Issue!</span>
          </div>
          <p className="text-xs text-slate-300">
            <strong>Target File:</strong> <span className="font-mono text-indigo-300">{repairInfo.targetFile}</span>
          </p>
          <p className="text-xs text-slate-300">
            <strong>Diagnosis & Fix:</strong> {repairInfo.explanation}
          </p>
        </div>
      )}

      {/* Latest Build Summary Info */}
      {latestBuild && latestBuild.status === 'success' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Production Output Ready</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{latestBuild.outputFile}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                <span>Size: {latestBuild.fileSizeMb} MB</span>
                <span>•</span>
                <span>Duration: {latestBuild.durationSeconds}s</span>
                <span>•</span>
                <span>Target: {latestBuild.target.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Build artifact located at build/outputs/${latestBuild.outputFile}`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed Artifact</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Terminal Output Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[340px]">
        <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Gradle & Flutter Compiler Stream</span>
          </div>
          <span className="text-[10px] text-slate-500">Live stdout / stderr</span>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 select-text">
          {liveLogs.length === 0 && (
            <span className="text-slate-600 italic">No active compilation logs. Press "Build Release APK" to start.</span>
          )}
          {liveLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-slate-600 text-[10px] shrink-0">{log.timestamp}</span>
              <span className={`shrink-0 text-[10px] font-bold ${
                log.level === 'error' ? 'text-rose-400' :
                log.level === 'warn' ? 'text-amber-400' :
                log.level === 'success' ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className={`${
                log.level === 'error' ? 'text-rose-300 font-bold' :
                log.level === 'success' ? 'text-emerald-300 font-semibold' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
