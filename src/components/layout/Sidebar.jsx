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
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ onNavigate }) {
  const { activeView, setActiveView, isSidebarCollapsed } = useApp();

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
      {/* Navigation List */}
      <nav className="p-2 sm:p-2.5 space-y-1 overflow-y-auto flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'space-x-3 px-3 py-2'
              } rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-950/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#171d28] border border-transparent'
              }`}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-orange-400 stroke-[2.5]' : 'text-slate-500'
                }`} 
              />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
