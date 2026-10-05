import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  BatteryMedium, 
  Search, 
  Heart, 
  User, 
  Home, 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle,
  Share2,
  Star,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Project } from '../types';

interface DeviceSimulatorViewProps {
  project: Project;
}

export const DeviceSimulatorView: React.FC<DeviceSimulatorViewProps> = ({ project }) => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'details' | 'search' | 'checkout' | 'profile'>('home');
  const [selectedItemId, setSelectedItemId] = useState<number>(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal' | 'manual'>('stripe');

  const { theme, payments } = project.spec;
  const primaryColor = theme.primaryColor || '#2563EB';

  const demoItems = [
    { id: 1, title: '2023 Premium Edition Sedan', price: '28,500', location: 'Metropolis Central', rating: 4.9, reviews: 34 },
    { id: 2, title: 'Sport Luxury Coupe AWD', price: '42,000', location: 'Downtown Marina', rating: 5.0, reviews: 18 },
    { id: 3, title: 'Hybrid Urban Explorer Eco', price: '23,900', location: 'Tech Park Blvd', rating: 4.8, reviews: 52 },
    { id: 4, title: 'Off-Road V8 Adventure SUV', price: '54,500', location: 'North Highlands', rating: 4.9, reviews: 29 }
  ];

  const selectedItem = demoItems.find(i => i.id === selectedItemId) || demoItems[0];

  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100 flex flex-col items-center">
      {/* Top Banner Notice */}
      <div className="w-full mb-6 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Flutter Android Device Simulation</h2>
            <p className="text-[11px] text-slate-400">
              Interactive high-fidelity preview rendered according to <span className="font-mono text-indigo-300">app-spec.json</span> and <span className="font-mono text-indigo-300">lib/main.dart</span>.
            </p>
          </div>
        </div>

        {/* Screen Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              currentScreen === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentScreen('details')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              currentScreen === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Item Details
          </button>
          <button
            onClick={() => setCurrentScreen('checkout')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              currentScreen === 'checkout' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Checkout
          </button>
          <button
            onClick={() => setCurrentScreen('profile')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              currentScreen === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Realistic Android Phone Outer Shell */}
      <div className="relative w-[380px] h-[740px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 flex flex-col shrink-0 select-none">
        {/* Dynamic Island / Camera Punch Hole */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 border border-slate-800/80 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/50" />
        </div>

        {/* Inner Screen Canvas */}
        <div className="w-full h-full bg-slate-100 text-slate-900 rounded-[38px] overflow-hidden flex flex-col relative font-sans">
          {/* Android Status Bar */}
          <div className="h-9 px-6 flex items-center justify-between text-[11px] font-bold text-slate-700 shrink-0 bg-white border-b border-slate-200/50">
            <span>12:45</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content Router */}
          <div className="flex-1 overflow-y-auto">
            {/* 1. HOME SCREEN */}
            {currentScreen === 'home' && (
              <div className="pb-16">
                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Welcome back</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{project.name}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="p-4">
                  <div 
                    style={{ backgroundColor: primaryColor }}
                    className="p-5 rounded-2xl text-white shadow-lg relative overflow-hidden"
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Verified Listings</span>
                    <h4 className="text-lg font-black mt-2 leading-tight">Find Your Next Vehicle & Deal</h4>
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{project.description}</p>
                    <button 
                      onClick={() => setCurrentScreen('details')}
                      className="mt-4 px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-sm"
                    >
                      Browse Featured
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="px-4 mb-4">
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-slate-400 shadow-sm">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Search catalog by model, price, specs...</span>
                  </div>
                </div>

                {/* Catalog Grid */}
                <div className="px-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Popular Listings</span>
                    <span className="text-[11px] text-indigo-600">See All</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {demoItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setCurrentScreen('details');
                        }}
                        className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-2">
                          <ShoppingBag className="w-8 h-8 opacity-40" />
                        </div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.location}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span 
                            style={{ color: primaryColor }}
                            className="font-extrabold text-xs"
                          >
                            ${item.price}
                          </span>
                          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                            ★ {item.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ITEM DETAILS SCREEN */}
            {currentScreen === 'details' && (
              <div className="pb-16">
                <div className="relative h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                  <button 
                    onClick={() => setCurrentScreen('home')}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <ShoppingBag className="w-16 h-16 opacity-30" />
                </div>

                <div className="p-4 bg-white rounded-t-3xl -mt-4 shadow-lg space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Available • In Stock
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID: #{selectedItem.id}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{selectedItem.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>★ {selectedItem.rating} ({selectedItem.reviews} reviews)</span>
                      <span>•</span>
                      <span>{selectedItem.location}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-slate-100 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Total Price</span>
                      <span 
                        style={{ color: primaryColor }}
                        className="text-xl font-extrabold"
                      >
                        ${selectedItem.price} {payments.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Architecture Specification</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Synced with real backend MySQL table <span className="font-mono text-indigo-600">items</span> and verified via PHP 8.2 endpoint. Supports instant checkout or direct chat with seller.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentScreen('checkout')}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md mt-4 transition"
                  >
                    Proceed to Payment / Checkout
                  </button>
                </div>
              </div>
            )}

            {/* 3. CHECKOUT & PAYMENT SCREEN */}
            {currentScreen === 'checkout' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentScreen('details')}
                    className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-base font-bold text-slate-900">Checkout & Pay</h3>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Order Summary</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-slate-800">{selectedItem.title}</span>
                    <span className="text-xs font-black">${selectedItem.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Tax & Processing</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-xs font-extrabold text-slate-900">
                    <span>Total Due</span>
                    <span style={{ color: primaryColor }}>${selectedItem.price} {payments.currency}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Select Gateway</span>

                  <label 
                    onClick={() => setSelectedGateway('stripe')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      selectedGateway === 'stripe' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Stripe Secure Card</span>
                    </div>
                    <input type="radio" checked={selectedGateway === 'stripe'} readOnly />
                  </label>

                  <label 
                    onClick={() => setSelectedGateway('paypal')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      selectedGateway === 'paypal' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 font-bold text-blue-600 text-xs">PP</span>
                      <span className="text-xs font-bold text-slate-800">PayPal Express</span>
                    </div>
                    <input type="radio" checked={selectedGateway === 'paypal'} readOnly />
                  </label>

                  <label 
                    onClick={() => setSelectedGateway('manual')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      selectedGateway === 'manual' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-bold text-slate-800">Bank Wire / Cash</span>
                    </div>
                    <input type="radio" checked={selectedGateway === 'manual'} readOnly />
                  </label>
                </div>

                {paymentSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-emerald-800">Transaction Confirmed!</h4>
                    <p className="text-[11px] text-emerald-700">Receipt generated and synced to MySQL payments table.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setPaymentSuccess(true)}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md mt-4"
                  >
                    Complete Purchase (${selectedItem.price})
                  </button>
                )}
              </div>
            )}

            {/* 4. PROFILE SCREEN */}
            {currentScreen === 'profile' && (
              <div className="p-4 space-y-4">
                <div className="text-center py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-2">
                    AF
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">AppForge User</h4>
                  <span className="text-xs text-slate-400">user@appforge.local</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <span>Order History</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span>Saved Favorites</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <span>Privacy Policy & Terms</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-around text-slate-500 shrink-0">
            <button 
              onClick={() => setCurrentScreen('home')}
              className={`flex flex-col items-center gap-0.5 ${currentScreen === 'home' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px]">Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('details')}
              className={`flex flex-col items-center gap-0.5 ${currentScreen === 'details' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px]">Catalog</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('checkout')}
              className={`flex flex-col items-center gap-0.5 ${currentScreen === 'checkout' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px]">Pay</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className={`flex flex-col items-center gap-0.5 ${currentScreen === 'profile' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <User className="w-4 h-4" />
              <span className="text-[10px]">Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
