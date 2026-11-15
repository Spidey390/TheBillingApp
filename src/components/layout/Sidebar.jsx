import React from 'react';
import {
  LayoutDashboard,
  Zap,
  CheckSquare,
  Grid2X2,
  UtensilsCrossed,
  PackageCheck,
  Users,
  Truck,
  Wallet,
  BarChart3,
  UserCheck,
  Settings,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { activeView, setActiveView, openModal } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS / New Bill', icon: Zap },
    { id: 'orders', label: 'Orders & KDS', icon: CheckSquare },
    { id: 'tables', label: 'Tables Floor', icon: Grid2X2 },
    { id: 'menu', label: 'Menu & Products', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory & BOM', icon: PackageCheck },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'reports', label: 'Reports & GST', icon: BarChart3 },
    { id: 'staff', label: 'Staff & Roles', icon: UserCheck },
    { id: 'settings', label: 'Cafe Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#10141d] border-r border-[#202735] flex flex-col justify-between select-none shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <nav className="p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-950/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#171d28] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Lifetime Box */}
      <div className="p-3 border-t border-[#1c2331]">
        <div 
          onClick={() => openModal('landing')}
          className="p-2.5 rounded-xl bg-gradient-to-br from-[#181e2b] to-[#121620] border border-[#263143] text-center hover:border-orange-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-center space-x-1.5 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              CAFFEFLOW ENTERPRISE
            </span>
          </div>
          <div className="text-[11px] font-bold text-white group-hover:text-orange-300 transition-colors">
            FREE LIFETIME EDITION
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            No Subscription • ₹0/Month
          </div>
        </div>
      </div>
    </aside>
  );
}
