import {
  LayoutDashboard, Zap, CheckSquare, Grid2X2, UtensilsCrossed, Users,
  Wallet, BarChart3, UserCheck, Settings
} from 'lucide-react';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS / New Bill', mobileTitle: 'POS', icon: Zap },
  { id: 'orders', label: 'Orders', icon: CheckSquare },
  { id: 'tables', label: 'Tables', icon: Grid2X2 },
  { id: 'menu', label: 'Menu & Products', icon: UtensilsCrossed },
  { id: 'customers', label: 'Customers CRM', icon: Users },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'staff', label: 'Staff & Roles', icon: UserCheck },
  { id: 'settings', label: 'Cafe Settings', icon: Settings }
];
