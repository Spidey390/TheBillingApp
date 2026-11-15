import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  Store, 
  Users, 
  TrendingUp, 
  Plus, 
  MapPin, 
  Edit, 
  Trash2, 
  Download, 
  RotateCcw, 
  Database, 
  Save, 
  Printer, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OwnerHub() {
  const { 
    currentUser, 
    orders, 
    shops, 
    setShops, 
    activeShopId, 
    activeShop, 
    switchShop, 
    createShop, 
    staff, 
    setStaff, 
    settings, 
    setSettings, 
    exportDatabase, 
    importDatabase, 
    resetDemoData, 
    openModal, 
    showToast,
    setActiveView,
    firebaseConfig,
    isFirebaseSyncActive,
    updateFirebaseConfig
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'shops', 'staff', 'settings'

  // Firebase config form states
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig?.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig?.projectId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [fbAppId, setFbAppId] = useState(firebaseConfig?.appId || '');

  // Form states for creating a new shop
  const [showNewShopForm, setShowNewShopForm] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopCode, setNewShopCode] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopCity, setNewShopCity] = useState('Bengaluru');
  const [newShopPhone, setNewShopPhone] = useState('+91 98765 ');

  // Form states for adding/editing staff
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('STAFF');
  const [staffDesignation, setStaffDesignation] = useState('Counter Cashier');
  const [staffShopId, setStaffShopId] = useState(shops[0]?.id || '');
  const [staffPhone, setStaffPhone] = useState('+91 98765 ');
  const [staffPin, setStaffPin] = useState('1234');

  // Form state for settings
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Scoped orders based on activeShopId
  const scopedOrders = useMemo(() => {
    if (activeShopId === 'all') return orders;
    return orders.filter(o => o.shopId === activeShopId || !o.shopId);
  }, [orders, activeShopId]);

  // Financial calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = scopedOrders.filter(o => 
    o.createdAt?.startsWith(todayStr) || 
    (o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString())
  );
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSales = scopedOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(1) : '0.0';

  // Handle new shop creation
  const handleCreateShop = (e) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    createShop({
      name: newShopName.trim(),
      code: newShopCode.trim().toUpperCase() || `BLR-${Math.floor(100 + Math.random() * 900)}`,
      address: newShopAddress.trim(),
      city: newShopCity.trim(),
      phone: newShopPhone.trim()
    });

    setNewShopName('');
    setNewShopCode('');
    setNewShopAddress('');
    setShowNewShopForm(false);
  };

  // Handle staff save
  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingStaffId) {
      setStaff(staff.map(s => s.id === editingStaffId ? {
        ...s,
        name: staffName.trim(),
        role: staffRole,
        designation: staffDesignation,
        shopId: staffRole === 'OWNER' ? null : (staffShopId || null),
        phone: staffPhone.trim(),
        pin: staffPin.trim()
      } : s));
      showToast('Staff profile updated');
    } else {
      const newStaffObj = {
        id: 'stf-' + Date.now(),
        name: staffName.trim(),
        email: `staff${staff.length + 1}@brewandbite.com`,
        role: staffRole,
        designation: staffDesignation,
        shopId: staffRole === 'OWNER' ? null : (staffShopId || null),
        phone: staffPhone.trim(),
        pin: staffPin.trim() || '1111',
        status: 'Active'
      };
      setStaff([...staff, newStaffObj]);
      showToast(`Added ${newStaffObj.name} to shop team!`);
    }
    setShowStaffModal(false);
  };

  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRole('STAFF');
    setStaffDesignation('Counter Cashier');
    setStaffShopId(shops[0]?.id || '');
    setStaffPhone('+91 98765 ');
    setStaffPin('1234');
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (s) => {
    setEditingStaffId(s.id);
    setStaffName(s.name);
    setStaffRole(s.role);
    setStaffDesignation(s.designation || (s.role === 'OWNER' ? 'Enterprise Owner' : 'Staff'));
    setStaffShopId(s.shopId || '');
    setStaffPhone(s.phone);
    setStaffPin(s.pin);
    setShowStaffModal(true);
  };

  const handleDeleteStaff = (id) => {
    if (staff.length <= 1) {
      showToast('Cannot delete the master owner account', 'warning');
      return;
    }
    setStaff(staff.filter(s => s.id !== id));
    showToast('Staff member removed');
  };

  // Handle settings save
  const handleSaveSettings = (e) => {
    e?.preventDefault();
    setSettings(settingsForm);
    showToast('Cafe settings saved to database');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header & Navigation Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141924] p-4 sm:p-5 rounded-3xl border border-[#232c3f]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Owner Master Control</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  ALL SHOPS ADMIN
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all your cafe shops, view live billing revenue, and add staff members.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch POS Billing Button */}
        <button
          onClick={() => setActiveView('pos')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start md:self-auto active:scale-95"
        >
          <span>SWITCH TO BILLING POS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Navigation Subtabs */}
      <div className="bg-[#121622] p-1.5 rounded-2xl border border-[#21293a] flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Sales & Invoices', icon: TrendingUp },
          { id: 'shops', label: `🏢 Outlets & Shops (${shops.length})`, icon: Store },
          { id: 'staff', label: `👥 Staff & Cashiers (${staff.length})`, icon: Users },
          { id: 'settings', label: '⚙️ Settings & Database', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#181f2c]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW (SALES & INVOICES)                              */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Outlet Filter Switcher Bar */}
          <div className="bg-[#151a24] p-3 rounded-2xl border border-[#222a38] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                ACTIVE OUTLET:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => switchShop('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activeShopId === 'all'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-[#1b2230] text-slate-300 hover:text-white border border-[#2b364a]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>All Shops (Consolidated)</span>
                </button>

                {shops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => switchShop(shop.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      activeShopId === shop.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-[#1b2230] text-slate-300 hover:text-white border border-[#2b364a]'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{shop.name.split('-')[1]?.trim() || shop.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {activeShopId === 'all' ? 'All Outlets' : (activeShop?.name || 'Selected Outlet')}
            </span>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today's Revenue */}
            <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Today's Sales</span>
                <IndianRupee className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                ₹{todaySales.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {todayOrders.length} bills punched today
              </div>
            </div>

            {/* Card 2: Total Revenue */}
            <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Gross Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                ₹{totalSales.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                From {scopedOrders.length} total completed orders
              </div>
            </div>

            {/* Card 3: Active Outlets */}
            <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Outlets / Shops</span>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                {shops.length} Outlets
              </div>
              <div className="text-[11px] text-blue-400 mt-1 font-semibold">
                All 100% active & operational
              </div>
            </div>

            {/* Card 4: Staff Count */}
            <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Team Members</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                {staff.length} Staff
              </div>
              <div className="text-[11px] text-purple-400 mt-1">
                Across {shops.length} cafe outlets
              </div>
            </div>
          </div>

          {/* Recent Invoices / Orders Table */}
          <div className="bg-[#151a24] rounded-2xl border border-[#222a38] overflow-hidden">
            <div className="p-4 border-b border-[#21293a] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Invoices Punched ({scopedOrders.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click any invoice to view and reprint receipt
                </p>
              </div>
              <button
                onClick={() => setActiveView('pos')}
                className="text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                + Punch New Bill (F4)
              </button>
            </div>

            {scopedOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No bills punched yet for this selection. Open the Billing tab to punch your first order!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#11141c] text-slate-400 border-b border-[#1f2737]">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Outlet / Branch</th>
                      <th className="py-3 px-4">Customer & Table</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 font-mono text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2638]">
                    {scopedOrders.slice(0, 15).map(order => (
                      <tr key={order.id} className="hover:bg-[#181f2c] transition-colors">
                        <td className="py-3 px-4 font-bold text-white font-mono">
                          {order.invoiceNo}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {order.displayDate}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {order.shopName || shops.find(s => s.id === order.shopId)?.name || 'Main Outlet'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-semibold">{order.customerName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {order.channel} {order.table ? `• ${order.table}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1d2636] text-slate-200 border border-[#2b374c]">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white font-mono">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openModal('receipt', order)}
                            className="p-1.5 rounded-lg bg-[#1f2838] hover:bg-orange-500 hover:text-white text-slate-300 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SHOPS & OUTLETS                                          */}
      {/* ============================================================== */}
      {activeTab === 'shops' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Your Cafe Outlets</h3>
              <p className="text-xs text-slate-400">Create new branches and switch live outlet billing</p>
            </div>
            <button
              onClick={() => setShowNewShopForm(!showNewShopForm)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewShopForm ? 'View All Shops' : 'Create New Shop'}</span>
            </button>
          </div>

          {/* Create New Shop Form */}
          {showNewShopForm && (
            <form onSubmit={handleCreateShop} className="p-5 rounded-2xl bg-[#161c27] border border-[#263143] space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#242f42] pb-2">
                Add New Cafe Branch / Outlet
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Shop / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Brew & Bite - Whitefield"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Branch Code</label>
                  <input
                    type="text"
                    value={newShopCode}
                    onChange={(e) => setNewShopCode(e.target.value)}
                    placeholder="e.g. BLR-WHI"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Address</label>
                  <input
                    type="text"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    placeholder="Street, Landmark, Area"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={newShopCity}
                    onChange={(e) => setNewShopCity(e.target.value)}
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#242f42]">
                <button
                  type="button"
                  onClick={() => setShowNewShopForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#1c2331] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                >
                  Save & Activate Branch
                </button>
              </div>
            </form>
          )}

          {/* Shops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map(shop => {
              const isSelected = activeShopId === shop.id;
              const shopOrders = orders.filter(o => o.shopId === shop.id);
              const shopSales = shopOrders.reduce((s, o) => s + o.total, 0);
              const shopStaffMembers = staff.filter(s => s.shopId === shop.id);

              return (
                <div
                  key={shop.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/40'
                      : 'bg-[#151a24] border-[#232b38] hover:border-[#333e52]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{shop.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10141d] text-orange-400 border border-[#283244]">
                            {shop.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{shop.address || shop.city}</span>
                        </p>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#202737] text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">TOTAL SALES</span>
                        <span className="font-extrabold text-white font-mono">₹{shopSales.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">INVOICES</span>
                        <span className="font-extrabold text-white font-mono">{shopOrders.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#202737] flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {shopStaffMembers.length} staff member{shopStaffMembers.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => switchShop(shop.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-orange-500/20 text-orange-400 cursor-default'
                          : 'bg-[#1e2636] hover:bg-orange-500 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Switch Outlet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STAFF MANAGEMENT                                         */}
      {/* ============================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Cafe Personnel & Cashiers</h3>
              <p className="text-xs text-slate-400">Add staff members and assign them to specific shops with a 4-digit PIN</p>
            </div>
            <button
              onClick={handleOpenAddStaff}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-[#151a24] rounded-2xl border border-[#222a38] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#11141c] text-slate-400 border-b border-[#1f2737]">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Assigned Shop</th>
                    <th className="py-3 px-4">Login PIN</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638]">
                  {staff.map(s => {
                    const isOwner = s.role === 'OWNER';
                    const assignedShop = shops.find(shp => shp.id === s.shopId);

                    return (
                      <tr key={s.id} className="hover:bg-[#181f2c] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOwner
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {s.role}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{s.designation}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {isOwner ? (
                            <span className="text-amber-400 font-bold">All Outlets (Owner)</span>
                          ) : (
                            assignedShop?.name || 'Unassigned'
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-300">
                          •••• ({s.pin})
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {s.phone}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditStaff(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#20293a]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {!isOwner && (
                              <button
                                onClick={() => handleDeleteStaff(s.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#20293a]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Staff Modal */}
          {showStaffModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-[#161c28] border border-[#273245] rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
                <h3 className="text-sm font-bold text-white border-b border-[#242f40] pb-2">
                  {editingStaffId ? 'Edit Staff Profile' : 'Add New Staff Member'}
                </h3>

                <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">System Role</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full bg-[#11151f] text-white px-2 py-2 rounded-xl border border-[#2b374c]"
                      >
                        <option value="STAFF">STAFF (Cashier)</option>
                        <option value="OWNER">OWNER (Full Admin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">4-Digit PIN *</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={staffPin}
                        onChange={(e) => setStaffPin(e.target.value)}
                        className="w-full bg-[#11151f] text-white px-2 py-2 rounded-xl border border-[#2b374c] font-mono text-center tracking-widest font-bold"
                      />
                    </div>
                  </div>

                  {staffRole !== 'OWNER' && (
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Assign to Shop / Outlet *</label>
                      <select
                        value={staffShopId}
                        onChange={(e) => setStaffShopId(e.target.value)}
                        className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-semibold"
                      >
                        {shops.map(shop => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name} ({shop.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Contact Phone</label>
                    <input
                      type="text"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-[#242f40]">
                    <button
                      type="button"
                      onClick={() => setShowStaffModal(false)}
                      className="px-3 py-1.5 rounded-xl bg-[#1c2331] text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                    >
                      Save Staff Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SETTINGS & DATABASE                                      */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Business & GST Form */}
          <form onSubmit={handleSaveSettings} className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#222a38] pb-2">
              Brand Identity & GST Rates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Cafe / Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Owner Full Name</label>
                <input
                  type="text"
                  value={settingsForm.ownerName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">GSTIN Number</label>
                <input
                  type="text"
                  value={settingsForm.gstin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">UPI ID for Dynamic QR</label>
                <input
                  type="text"
                  value={settingsForm.upiVpaId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiVpaId: e.target.value })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">GST Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settingsForm.gstRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gstRate: Number(e.target.value) })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Invoice Prefix</label>
                <input
                  type="text"
                  value={settingsForm.invoicePrefix}
                  onChange={(e) => setSettingsForm({ ...settingsForm, invoicePrefix: e.target.value })}
                  className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#222a38]">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* Firebase Cloud Sync Card */}
          <div className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
            <div className="flex items-center justify-between border-b border-[#222a38] pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>🔥 Firebase Cloud Firestore (Web & Mobile Real-Time Sync)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sync all billing transactions, shops, and staff live across counter web POS, mobile phones, and tablets.
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isFirebaseSyncActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {isFirebaseSyncActive ? '● CLOUD SYNC ACTIVE' : '○ OFFLINE LOCAL MODE'}
              </span>
            </div>

            {isFirebaseSyncActive ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    Connected to Project: {firebaseConfig?.projectId}
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-0.5">
                    Live bidirectional real-time listeners connected. Data syncs to all devices in &lt;100ms with offline IndexedDB fallback.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateFirebaseConfig(null)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  Disconnect Cloud
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Enter your Firebase web app configuration from <strong className="text-white">console.firebase.google.com</strong> to enable multi-device sync:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Firebase API Key *</label>
                    <input
                      type="text"
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Project ID *</label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="e.g. brew-bite-pos-123"
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Auth Domain</label>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      placeholder="project-id.firebaseapp.com"
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">App ID</label>
                    <input
                      type="text"
                      value={fbAppId}
                      onChange={(e) => setFbAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!fbApiKey.trim() || !fbProjectId.trim()) {
                        showToast('Please enter at least API Key and Project ID', 'warning');
                        return;
                      }
                      updateFirebaseConfig({
                        apiKey: fbApiKey.trim(),
                        projectId: fbProjectId.trim(),
                        authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
                        appId: fbAppId.trim()
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                  >
                    Connect Firebase Cloud Sync
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Database & Offline Storage Management */}
          <div className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#222a38] pb-2">
              IndexedDB Database Backup & Maintenance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Backup */}
              <div className="p-4 rounded-2xl bg-[#11151f] border border-[#232b3a] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Download JSON Backup</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Export full database snapshot of all shops, orders, and staff.</p>
                </div>
                <button
                  onClick={exportDatabase}
                  className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              {/* Restore */}
              <div className="p-4 rounded-2xl bg-[#11151f] border border-[#232b3a] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Restore From Backup</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Select a previously downloaded `.json` backup file.</p>
                </div>
                <label className="mt-3 w-full py-2 rounded-xl bg-[#1d2638] hover:bg-[#28354c] text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer border border-[#2c3a50]">
                  <Database className="w-3.5 h-3.5 text-orange-400" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result;
                          if (content && typeof content === 'string') {
                            if (confirm('Restoring this backup will overwrite current local database records. Proceed?')) {
                              importDatabase(content);
                            }
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Reset */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Clean Production Reset</h4>
                  <p className="text-[11px] text-rose-400/80 mt-1">Clears all orders and test data (keeps menu items & master shops).</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset orders to zero?')) {
                      resetDemoData();
                    }
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
