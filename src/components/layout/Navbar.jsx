import React, { useState } from 'react';
import { 
  Coffee, 
  Zap, 
  Maximize, 
  Minimize, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  BookOpen, 
  CheckCircle2,
  ChevronDown,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { 
    settings, 
    activeView, 
    setActiveView, 
    openModal, 
    orders, 
    rawMaterials 
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const lowStockCount = rawMaterials.filter(r => r.currentStock <= r.minThreshold).length;

  return (
    <header className="h-16 bg-[#12161f] border-b border-[#232b38] px-4 flex items-center justify-between select-none relative z-30">
      {/* Left: Brand & Location */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => setActiveView('dashboard')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40 cursor-pointer"
        >
          <Coffee className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 
              onClick={() => setActiveView('dashboard')}
              className="text-base font-bold text-white tracking-tight cursor-pointer hover:text-orange-400 transition-colors"
            >
              {settings.brandName}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ₹0/MO FREE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {settings.tagline || 'Bengaluru • Fast Counter POS'}
          </p>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center space-x-2.5">
        {/* POS Fast Button */}
        <button
          onClick={() => setActiveView('pos')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'pos'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400'
              : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>POS BILLING</span>
        </button>

        {/* Landing & Features Button */}
        <button
          onClick={() => openModal('landing')}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1c232f] hover:bg-[#252f3f] text-slate-300 border border-[#2b3545] transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-orange-400" />
          <span>Landing & Features</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen POS"}
          className="p-2 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-slate-400 hover:text-slate-200 border border-[#283244] transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Theme indicator */}
        <button
          title="Dark Mode Active"
          className="p-2 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-amber-400 border border-[#283244] transition-colors"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-slate-400 hover:text-slate-200 border border-[#283244] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#12161f] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1a212e] border border-[#2a3548] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#2a3548]">
                <span className="text-xs font-bold text-slate-200">Alerts & System Feed</span>
                <span className="text-[10px] text-slate-400">Real-time</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-lg bg-[#141923] border border-[#232b3a] text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>POS Terminal Online</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Offline SQLite/IndexedDB active with GST 5% auto-calculation.</p>
                </div>
                {lowStockCount > 0 ? (
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                    <div className="font-semibold">{lowStockCount} raw materials below min threshold</div>
                    <p className="text-[11px] text-rose-400/80 mt-0.5">Check Inventory & BOM tab to reorder stock.</p>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-[#141923] border border-[#232b3a] text-xs text-slate-400">
                    All inventory raw materials in sufficient quantity.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-[#181e29] hover:bg-[#222a3a] border border-[#283244] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-xs">
              RK
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 leading-none">{settings.ownerName}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Owner / Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a212e] border border-[#2a3548] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 border-b border-[#283244] mb-1">
                <div className="text-xs font-bold text-white">{settings.ownerName}</div>
                <div className="text-[10px] text-slate-400 truncate">{settings.email}</div>
              </div>
              <button
                onClick={() => { setActiveView('settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#252f40] hover:text-white transition-colors"
              >
                Cafe Settings
              </button>
              <button
                onClick={() => { setActiveView('staff'); setShowProfileMenu(false); }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#252f40] hover:text-white transition-colors"
              >
                Staff & Roles
              </button>
              <button
                onClick={() => { openModal('landing'); setShowProfileMenu(false); }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-orange-400 hover:bg-orange-500/10 transition-colors font-medium"
              >
                Software Specs & Docs
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
