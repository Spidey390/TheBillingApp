import React from 'react';
import {
  Zap,
  ShieldCheck,
  Store,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ onNavigate }) {
  const { activeView, setActiveView, isSidebarCollapsed, currentUser, activeShop } = useApp();

  const isOwner = currentUser?.role === 'OWNER';

  const menuItems = isOwner ? [
    { 
      id: 'owner', 
      label: 'Owner Hub', 
      subtitle: 'Shops, Sales & Staff',
      icon: ShieldCheck 
    }
  ] : [
    { 
      id: 'pos', 
      label: 'Billing (POS)', 
      subtitle: activeShop?.name || 'Counter Billing',
      icon: Zap 
    }
  ];

  const handleSelect = (id) => {
    setActiveView(id);
    if (onNavigate) onNavigate();
  };

  return (
    <aside 
      className={`${
        isSidebarCollapsed ? 'w-16' : 'w-56'
      } bg-[#10141d] border-r border-[#202735] flex flex-col justify-between select-none shrink-0 h-full transition-all duration-200 overflow-hidden`}
    >
      {/* Navigation List: Strictly Billing & Owner */}
      <nav className="p-2 sm:p-2.5 space-y-2 overflow-y-auto flex-1">
        <div className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
          MAIN MENU
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-3'
              } rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/10 text-orange-400 border border-orange-500/40 shadow-md shadow-orange-950/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#171d28] border border-transparent'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-orange-400 stroke-[2.5]' : 'text-slate-500'
                }`} 
              />
              {!isSidebarCollapsed && (
                <div className="text-left truncate">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Box */}
      <div className="p-2.5 border-t border-[#1c2331] shrink-0">
        <div 
          className={`rounded-2xl bg-[#141924] border border-[#232b3b] ${
            isSidebarCollapsed ? 'p-2 text-center' : 'p-3 text-left'
          }`}
        >
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-1.5 text-orange-400 mb-1">
                <Store className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {currentUser?.role === 'OWNER' ? 'ENTERPRISE OWNER' : 'BILLING STAFF'}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 truncate font-medium">
                ● 100% Offline IndexedDB
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
