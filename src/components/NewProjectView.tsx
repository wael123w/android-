import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Smartphone, 
  Server, 
  Database, 
  CreditCard, 
  ShieldCheck, 
  Palette, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { AIProviderConfig, AppSpec } from '../types';

interface NewProjectViewProps {
  onGenerate: (data: {
    appName: string;
    packageName: string;
    prompt: string;
    primaryColor: string;
    secondaryColor: string;
    currency: string;
    provider: AIProviderConfig;
  }) => Promise<void>;
  providers: AIProviderConfig[];
  activeProvider: AIProviderConfig;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  onGenerate,
  providers,
  activeProvider
}) => {
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [prompt, setPrompt] = useState(
    'أريد تطبيقاً لبيع السيارات المستعملة يحتوي على تسجيل المستخدمين، إضافة السيارات، الصور، السعر، الموقع، البحث، الفلاتر، المفضلة، المحادثات، الإشعارات، الدفع عبر Stripe وPayPal، ولوحة تحكم للإدارة.'
  );
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#1D4ED8');
  const [currency, setCurrency] = useState('USD');
  const [selectedProviderId, setSelectedProviderId] = useState(activeProvider.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const currentProvider = providers.find(p => p.id === selectedProviderId) || activeProvider;

  const handleQuickTemplate = (templateName: string) => {
    if (templateName === 'cars') {
      setAppName('AutoForge Market');
      setPackageName('com.appforge.cars');
      setPrimaryColor('#2563EB');
      setSecondaryColor('#1D4ED8');
      setPrompt('أريد تطبيقاً لبيع السيارات المستعملة يحتوي على تسجيل المستخدمين، إضافة السيارات، الصور، السعر، الموقع، البحث، الفلاتر، المفضلة، المحادثات، الإشعارات، الدفع عبر Stripe وPayPal، ولوحة تحكم للإدارة.');
    } else if (templateName === 'food') {
      setAppName('QuickBite Delivery');
      setPackageName('com.appforge.food');
      setPrimaryColor('#EA580C');
      setSecondaryColor('#C2410C');
      setPrompt('تطبيق توصيل طعام للمطاعم والوجبات السريعة مع قوائم الوجبات، السلة، تتبع الطلب، الدفع، الإشعارات الفورية، ولوحة تحكم لإدارة الطلبات والمطابخ.');
    } else if (templateName === 'estate') {
      setAppName('EstateForge');
      setPackageName('com.appforge.estate');
      setPrimaryColor('#0D9488');
      setSecondaryColor('#0F766E');
      setPrompt('تطبيق عقارات لعرض وتأجير الشقق والفلل مع الخريطة، الفلاتر، حجز المواعيد، التواصل مع المالكين، ورفع العقود، مع لوحة إدارة للمكاتب العقارية.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const finalAppName = appName.trim() || 'AppForge Application';
    const finalPackage = packageName.trim() || `com.appforge.${finalAppName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    setIsGenerating(true);
    setGenerationStep('Analyzing natural language requirements pipeline...');
    
    try {
      await onGenerate({
        appName: finalAppName,
        packageName: finalPackage,
        prompt,
        primaryColor,
        secondaryColor,
        currency,
        provider: currentProvider
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Project Architect</span>
        <h1 className="text-2xl font-black text-white mt-1">Create New AI Android Application</h1>
        <p className="text-xs text-slate-400 mt-1">
          Specify your architecture parameters. The AI pipeline will generate a production-ready Flutter app, standalone PHP 8.2 backend, and MySQL database.
        </p>
      </div>

      {/* Quick Starter Templates */}
      <div className="mb-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400">Quick Archetypes:</span>
        <button
          type="button"
          onClick={() => handleQuickTemplate('cars')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
        >
          🚗 Car Marketplace
        </button>
        <button
          type="button"
          onClick={() => handleQuickTemplate('food')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
        >
          🍔 Food & Restaurant
        </button>
        <button
          type="button"
          onClick={() => handleQuickTemplate('estate')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
        >
          🏢 Real Estate & Rentals
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Prompt Box */}
        <div className="bg-slate-900 border border-indigo-900/40 p-6 rounded-2xl shadow-xl">
          <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Describe Your Application (Natural Language)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Arabic or English supported</span>
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            required
            placeholder="Describe your application features, modules, entities, payment logic, and workflows..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm text-slate-200 outline-none transition"
          />
        </div>

        {/* Basic Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="e.g. AutoForge Market"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Android Package Name</label>
            <input
              type="text"
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              placeholder="e.g. com.appforge.cars"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tech Stack & Target Specifications */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Mobile Target</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Flutter 3.22 (Dart)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Android 14 (API 34)</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Backend Runtime</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>PHP 8.2+ Standalone</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">cPanel / VPS native</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Database Engine</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Database className="w-4 h-4 text-amber-400" />
              <span>MySQL 8.0+ / MariaDB</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">InnoDB & UTF8MB4</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">AI Provider Engine</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <select
                value={selectedProviderId}
                onChange={e => setSelectedProviderId(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">{currentProvider.model}</span>
          </div>
        </div>

        {/* Theme & Branding */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            Brand Theme & Currency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Primary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-28"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Secondary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-28"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Default Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="KWD">KWD (د.ك)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button & Progress */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{generationStep || 'Synthesizing Architecture...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Application (Full Stack)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
