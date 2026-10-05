import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  CreditCard, 
  Settings, 
  FileText, 
  Search, 
  Check, 
  X, 
  Trash2, 
  CheckCircle2, 
  Sliders,
  ExternalLink
} from 'lucide-react';
import { Project } from '../types';

interface AdminPreviewViewProps {
  project: Project;
}

export const AdminPreviewView: React.FC<AdminPreviewViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'module' | 'pages' | 'settings'>('dashboard');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>(project.spec.adminPages[0]?.slug || 'items');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState([
    { id: 101, title: '2023 Premium Edition Sedan', status: 'pending', user: 'customer_1@appforge.local', date: '2026-10-04' },
    { id: 102, title: 'Sport Luxury Coupe AWD', status: 'approved', user: 'dealer_pro@appforge.local', date: '2026-10-03' },
    { id: 103, title: 'Hybrid Urban Explorer Eco', status: 'approved', user: 'eco_driver@appforge.local', date: '2026-10-02' },
    { id: 104, title: 'Off-Road V8 Adventure SUV', status: 'pending', user: 'safari_auto@appforge.local', date: '2026-10-01' }
  ]);

  const [settings, setSettings] = useState({
    appName: project.name,
    currency: project.spec.payments.currency,
    stripeMode: 'sandbox',
    paypalMode: 'sandbox',
    contactEmail: `admin@${project.packageName.split('.')[1] || 'app'}.com`
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleApprove = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const handleDelete = (id: number) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const activePageConfig = project.spec.adminPages.find(p => p.slug === selectedModuleSlug) || project.spec.adminPages[0];

  return (
    <div className="p-8 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100 space-y-6">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Generated PHP 8.2 + Tailwind Admin Panel</h2>
            <p className="text-[11px] text-slate-400">
              Live interactive preview of the standalone <span className="font-mono text-indigo-300">admin/index.php</span> dashboard generated for cPanel / VPS hosting.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          Standalone PHP Engine
        </span>
      </div>

      {/* Embedded Simulated Admin Window */}
      <div className="bg-white text-slate-900 rounded-3xl border border-slate-300 shadow-2xl overflow-hidden flex h-[680px]">
        {/* Admin Left Sidebar */}
        <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none text-xs">
          <div className="h-14 flex items-center gap-2.5 px-5 border-b border-slate-800 font-bold text-white">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs">
              {project.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate">{project.name}</span>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Generated Modules
            </div>

            {project.spec.adminPages.map(page => (
              <button
                key={page.slug}
                onClick={() => {
                  setSelectedModuleSlug(page.slug);
                  setActiveTab('module');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === 'module' && selectedModuleSlug === page.slug ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="truncate">{page.title}</span>
              </button>
            ))}

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              CMS & System
            </div>

            <button
              onClick={() => setActiveTab('pages')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition ${
                activeTab === 'pages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>CMS Pages</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Settings & Payments</span>
            </button>
          </nav>

          <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500">
            Admin Auth: <strong className="text-slate-400">admin@appforge.local</strong>
          </div>
        </aside>

        {/* Admin Main Canvas */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden font-sans">
          {/* Admin Top Header */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-sm">
              {activeTab === 'dashboard' && 'Executive Overview'}
              {activeTab === 'module' && activePageConfig?.title}
              {activeTab === 'pages' && 'Content Management (Legal & Policy Pages)'}
              {activeTab === 'settings' && 'System Configuration & Payment Keys'}
            </h3>

            <span className="text-xs text-slate-500">
              Role: <strong className="text-slate-800">Super Administrator</strong>
            </span>
          </header>

          {/* Admin View Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">1,248</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">+14% this month</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Listings</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">384</p>
                    <span className="text-[10px] text-indigo-600 font-semibold">Active catalog</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Pending Review</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">12</p>
                    <span className="text-[10px] text-slate-400">Awaiting approval</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Processed Revenue</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">$48,200</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Stripe & PayPal</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-xs mb-3">Recently Submitted Records Requiring Review</h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    {records.slice(0, 3).map(r => (
                      <div key={r.id} className="py-3 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900 block">{r.title}</strong>
                          <span className="text-slate-400 text-[11px]">{r.user} • {r.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. DYNAMIC MODULE CRUD VIEW */}
            {activeTab === 'module' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="relative w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search records..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700">
                    + Add New Record
                  </button>
                </div>

                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Title / Record</th>
                      <th className="p-3">Submitter</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-800">#{r.id}</td>
                        <td className="p-3 font-bold text-slate-900">{r.title}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{r.user}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                            r.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {r.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(r.id)}
                                className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(r.id)}
                                className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-bold text-[10px] hover:bg-amber-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDelete(r.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. CMS PAGES VIEW */}
            {activeTab === 'pages' && (
              <div className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'About Us', 'Refund Policy'].map(title => (
                  <div key={title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                      <p className="text-[11px] text-slate-400">Available publicly at /api/pages/{title.toLowerCase().replace(/ /g, '-')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">Live</span>
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700">
                        Edit Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. SETTINGS & PAYMENTS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
                {savedNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Settings successfully persisted to MySQL settings table!</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">App Name</label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={e => setSettings({ ...settings, appName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Currency</label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={e => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Payment Gateway Credentials (Secure Server Vault)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Stripe Mode</label>
                      <select 
                        value={settings.stripeMode}
                        onChange={e => setSettings({ ...settings, stripeMode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      >
                        <option value="sandbox">Sandbox / Test</option>
                        <option value="live">Production / Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">PayPal Mode</label>
                      <select 
                        value={settings.paypalMode}
                        onChange={e => setSettings({ ...settings, paypalMode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      >
                        <option value="sandbox">Sandbox / Test</option>
                        <option value="live">Production / Live</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Save System Parameters
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
