import React from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { canOpen } from '../../domain/access';
import { navigationItems } from './navigationItems';

export default function Sidebar({ onNavigate, mobile = false }) {
  const { activeView, setActiveView, isSidebarCollapsed, operator, isPaying, signOut } = useApp();

  const collapsed = !mobile && isSidebarCollapsed;

  const handleSelect = (id) => {
    setActiveView(id);
    if (onNavigate) onNavigate();
  };

  return (
    <nav aria-label="Workspace navigation"
      className={`flex min-h-0 flex-col select-none ${mobile ? 'w-full flex-1' :
        `h-full shrink-0 border-r border-[#202735] bg-[#10141d] transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-56'}`}`}>
      {/* Navigation List */}
      <div className={`min-h-0 flex-1 overflow-y-auto ${mobile ? 'space-y-0.5 px-3 py-2.5' : 'space-y-1 p-2 sm:p-2.5'}`}>
        {navigationItems.filter(item => canOpen(operator.role, item.id)).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id} type="button"
              onClick={() => handleSelect(item.id)}
              title={collapsed ? item.label : undefined}
              aria-label={item.label} aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center rounded-xl font-semibold transition-colors ${
                mobile ? 'min-h-11 gap-3 px-3 py-2 text-sm' : collapsed ? 'justify-center py-2.5 text-xs' : 'gap-3 px-3 py-2 text-xs'
              } ${
                isActive
                  ? mobile
                    ? 'bg-orange-500/10 text-orange-200'
                    : 'border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-orange-500/5 font-bold text-orange-400 shadow-sm shadow-orange-950/20'
                  : `text-slate-300 hover:bg-[#1b2230] hover:text-white ${mobile ? '' : 'border border-transparent'}`
              }`}
            >
              <Icon aria-hidden="true"
                className={`shrink-0 ${mobile ? 'size-[1.125rem]' : 'size-4'} ${
                  isActive ? 'text-orange-400' : 'text-slate-400'
                }`}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className={`shrink-0 border-t border-slate-700/60 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
        mobile ? 'px-3' : 'px-2 sm:px-2.5'
      }`}>
        <button type="button" aria-label="Sign out" title={collapsed ? 'Sign out' : undefined} disabled={isPaying} onClick={signOut}
          className={`flex min-h-11 w-full items-center gap-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 ${collapsed ? 'justify-center' : 'px-3'}`}>
          <LogOut className={`shrink-0 text-slate-400 ${mobile ? 'size-[1.125rem]' : 'size-4'}`} aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </nav>
  );
}
