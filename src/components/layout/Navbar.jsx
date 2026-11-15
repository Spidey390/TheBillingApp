import React, { useState } from 'react';
import { 
  Coffee, 
  Zap, 
  Maximize, 
  Minimize, 
  Moon, 
  Bell, 
  ChevronDown, 
  Menu, 
  Database, 
  ShoppingBag, 
  BookOpen, 
  CheckCircle2, 
  PanelLeftClose, 
  PanelLeft,
  Store,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { 
    settings, 
    currentUser,
    logout,
    shops,
    activeShopId,
    activeShop,
    switchShop,
    activeView, 
    setActiveView, 
    openModal, 
    rawMaterials,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDbReady,
    dbName,
    cart,
    cartTotal,
    setIsMobileCartOpen
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);

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
    <header className="h-14 sm:h-16 bg-[#12161f] border-b border-[#232b38] px-3 sm:px-4 flex items-center justify-between select-none shrink-0 relative z-30">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-slate-400 hover:text-white border border-[#283244] transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Rail Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-slate-400 hover:text-white border border-[#283244] transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar to Rail"}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-orange-400" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Brand Icon */}
        <div 
          onClick={() => setActiveView('dashboard')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40 cursor-pointer shrink-0"
        >
          <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
        </div>

        {/* Brand Name & DB Status */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h1 
              onClick={() => setActiveView('dashboard')}
              className="text-sm sm:text-base font-bold text-white tracking-tight cursor-pointer hover:text-orange-400 transition-colors truncate"
            >
              {settings.brandName}
            </h1>
            <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FREE LIFETIME
            </span>
            {/* Database indicator */}
            <div 
              title={dbName}
              className="hidden 2xl:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#18212e] text-[10px] text-cyan-300 border border-cyan-800/40 font-mono"
            >
              <Database className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Dexie DB</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isDbReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden xs:block">
            {settings.tagline || 'Bengaluru • Fast Counter POS'}
          </p>
        </div>
      </div>

      {/* Middle: Shop / Outlet Switcher */}
      <div className="relative mx-2">
        {currentUser?.role === 'OWNER' ? (
          <div>
            <button
              onClick={() => setShowShopDropdown(!showShopDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#18202d] hover:bg-[#20293b] border border-[#2b374c] transition-colors shadow-sm"
              title="Switch Active Outlet or View All Shops"
            >
              <Store className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="text-left hidden sm:block">
                <div className="text-[9px] uppercase font-black tracking-wider text-orange-400 leading-none">
                  ACTIVE OUTLET
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[140px] md:max-w-[180px]">
                  {activeShopId === 'all' ? 'All Shops (Consolidated)' : (activeShop?.name || 'Select Shop')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showShopDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#161c28] border border-[#273245] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                <div className="px-2.5 py-1.5 border-b border-[#242e40] mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Switch Outlet Live
                  </span>
                  <button
                    onClick={() => {
                      setShowShopDropdown(false);
                      openModal('shopManager');
                    }}
                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>

                {/* Option 1: All Shops Consolidated */}
                <button
                  onClick={() => {
                    switchShop('all');
                    setShowShopDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2.5 ${
                    activeShopId === 'all'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:bg-[#1f2838] hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="leading-tight">All Shops (Consolidated)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Global Enterprise KPI Dashboard</div>
                  </div>
                </button>

                {/* Specific Shops */}
                <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
                  {shops.map(shop => (
                    <button
                      key={shop.id}
                      onClick={() => {
                        switchShop(shop.id);
                        setShowShopDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2.5 ${
                        activeShopId === shop.id
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'text-slate-300 hover:bg-[#1f2838] hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate leading-tight">{shop.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {shop.code} • {shop.city}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-[#242e40]">
                  <button
                    onClick={() => {
                      setShowShopDropdown(false);
                      openModal('shopManager');
                    }}
                    className="w-full text-center py-1.5 rounded-lg text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                  >
                    + Add New Shop / Branch
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Staff Badge: Locked to Assigned Shop */
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#151c27] border border-[#243042] text-xs">
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <div className="text-[9px] uppercase font-black tracking-wider text-emerald-400 leading-none">
                ASSIGNED OUTLET
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                {activeShop?.name || 'Current Branch'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Mobile Cart Toggle & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Mobile/Tablet Cart Button */}
        {activeView === 'pos' && (
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="lg:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart ({cart.length})</span>
            <span className="font-mono text-white/90">₹{cartTotal.toFixed(0)}</span>
          </button>
        )}

        {/* Two Core Views: Billing & Owner */}
        <div className="flex items-center space-x-1 bg-[#171d2a] p-1 rounded-xl border border-[#263246]">
          <button
            onClick={() => setActiveView('pos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'pos'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>BILLING</span>
          </button>

          {currentUser?.role === 'OWNER' && (
            <button
              onClick={() => setActiveView('owner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'owner'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OWNER</span>
            </button>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen POS"}
          className="hidden sm:flex p-2 rounded-lg bg-[#181e29] hover:bg-[#222a3a] text-slate-400 hover:text-slate-200 border border-[#283244] transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
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
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold mb-0.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>IndexedDB Multi-Outlet Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Offline ACID storage enabled across {shops.length} branches.</p>
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
            className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 pr-2 sm:pr-2.5 py-1.5 rounded-lg bg-[#181e29] hover:bg-[#222a3a] border border-[#283244] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-xs">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'RK'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 leading-none">
                {currentUser ? currentUser.name : settings.ownerName}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {currentUser?.role === 'OWNER' ? 'Owner / Admin' : (currentUser?.designation || 'Staff')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1a212e] border border-[#2a3548] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 border-b border-[#283244] mb-1">
                <div className="text-xs font-bold text-white">{currentUser?.name}</div>
                <div className="text-[10px] text-orange-400 font-medium">
                  {currentUser?.role === 'OWNER' ? '👑 Master Owner' : `💼 Staff (${activeShop?.name || 'Outlet'})`}
                </div>
              </div>

              {currentUser?.role === 'OWNER' && (
                <>
                  <button
                    onClick={() => { openModal('shopManager'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#252f40] hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <Store className="w-3.5 h-3.5 text-orange-400" />
                    <span>Manage Shops & Outlets</span>
                  </button>
                  <button
                    onClick={() => { setActiveView('settings'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#252f40] hover:text-white transition-colors"
                  >
                    Cafe Settings & DB
                  </button>
                  <button
                    onClick={() => { setActiveView('staff'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#252f40] hover:text-white transition-colors"
                  >
                    Staff & Outlets Assignment
                  </button>
                </>
              )}

              <div className="border-t border-[#283244] mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / Switch User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
