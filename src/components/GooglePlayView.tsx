import React, { useState } from 'react';
import { 
  PlaySquare, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Package, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Project } from '../types';

interface GooglePlayViewProps {
  project: Project;
  onUpdateListing: (listing: any) => void;
  onNavigate: (view: string) => void;
}

export const GooglePlayView: React.FC<GooglePlayViewProps> = ({
  project,
  onUpdateListing,
  onNavigate
}) => {
  const [listing, setListing] = useState(project.playListing);
  const [saved, setSaved] = useState(false);
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateListing(listing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyPrivacyUrl = () => {
    navigator.clipboard.writeText(listing.privacyPolicyUrl);
    setCopiedPolicy(true);
    setTimeout(() => setCopiedPolicy(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Release Preparation</span>
          <h1 className="text-2xl font-black text-white mt-1">Google Play Console Publishing Kit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete store metadata, legal policy URLs, graphical specs, and AAB release compliance for the Google Play Developer Console.
          </p>
        </div>

        <button
          onClick={() => onNavigate('build_center')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
        >
          <Package className="w-4 h-4" />
          <span>Build Release AAB</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Metadata */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-indigo-400" />
            Store Listing Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">App Title (Max 30 chars)</label>
              <input
                type="text"
                value={listing.title}
                maxLength={30}
                onChange={e => setListing({ ...listing, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package Name / Application ID</label>
              <input
                type="text"
                value={project.packageName}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Short Description (Max 80 chars)</label>
            <input
              type="text"
              value={listing.shortDescription}
              maxLength={80}
              onChange={e => setListing({ ...listing, shortDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Description (Max 4000 chars)</label>
            <textarea
              value={listing.fullDescription}
              rows={4}
              onChange={e => setListing({ ...listing, fullDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Legal Policies & Compliance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Mandatory Legal URLs (Required by Google Play)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Privacy Policy URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={listing.privacyPolicyUrl}
                  onChange={e => setListing({ ...listing, privacyPolicyUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={copyPrivacyUrl}
                  className="px-3 py-2 bg-slate-800 rounded-xl text-xs text-slate-300 hover:bg-slate-700"
                >
                  {copiedPolicy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Terms of Service URL</label>
              <input
                type="text"
                value={listing.termsUrl}
                onChange={e => setListing({ ...listing, termsUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Graphical Assets Specification */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Graphic Assets Standards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block">App Icon</span>
              <span className="text-[11px] text-slate-400 mt-1 block">512 x 512 px (PNG 32-bit with alpha)</span>
              <span className="text-[10px] text-indigo-400 mt-2 block font-mono">res/mipmap-xxxhdpi/ic_launcher.png</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block">Feature Graphic</span>
              <span className="text-[11px] text-slate-400 mt-1 block">1024 x 500 px (JPEG or PNG 24-bit)</span>
              <span className="text-[10px] text-indigo-400 mt-2 block font-mono">Store promotional banner</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block">Phone Screenshots</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Minimum 2, Maximum 8 screenshots</span>
              <span className="text-[10px] text-indigo-400 mt-2 block font-mono">16:9 or 9:16 aspect ratio</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            {saved ? 'Saved Successfully!' : 'Save Store Listing Configuration'}
          </button>

          <span className="text-xs text-slate-500 italic">
            Exports with your project ZIP inside google-play-listing.json
          </span>
        </div>
      </form>
    </div>
  );
};
