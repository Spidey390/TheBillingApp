import React, { useMemo } from 'react';
import { 
  Zap, 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  Clock, 
  AlertTriangle, 
  Users, 
  Utensils,
  Store,
  ArrowRight,
  Plus,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OperationsDashboard() {
  const { 
    setActiveView, 
    orders, 
    expenses, 
    customers, 
    products, 
    rawMaterials,
    shops,
    activeShopId,
    activeShop,
    switchShop,
    currentUser,
    openModal,
    staff
  } = useApp();

  // Scoped orders & expenses based on activeShopId
  const scopedOrders = useMemo(() => {
    if (activeShopId === 'all') return orders;
    return orders.filter(o => o.shopId === activeShopId || !o.shopId);
  }, [orders, activeShopId]);

  const scopedExpenses = useMemo(() => {
    if (activeShopId === 'all') return expenses;
    return expenses.filter(e => e.shopId === activeShopId || !e.shopId);
  }, [expenses, activeShopId]);

  // Calculate real values from scoped state
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = scopedOrders.filter(o => 
    o.createdAt?.startsWith(todayStr) || 
    (o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString())
  );
  
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(1) : '0.0';
  const totalExpenses = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lowStockCount = rawMaterials.filter(r => r.currentStock <= r.minThreshold).length;

  // Breakdown by payment
  const paymentBreakdown = {
    Card: scopedOrders.filter(o => o.paymentMethod === 'Card').reduce((s, o) => s + o.total, 0),
    Cash: scopedOrders.filter(o => o.paymentMethod === 'Cash').reduce((s, o) => s + o.total, 0),
    Split: scopedOrders.filter(o => o.paymentMethod === 'Split').reduce((s, o) => s + o.total, 0),
    Upi: scopedOrders.filter(o => o.paymentMethod === 'UPI').reduce((s, o) => s + o.total, 0)
  };
  const totalPayAmount = paymentBreakdown.Card + paymentBreakdown.Cash + paymentBreakdown.Split + paymentBreakdown.Upi;

  // Best selling items aggregated from actual orders
  const bestSellers = useMemo(() => {
    const counts = {};
    scopedOrders.forEach(ord => {
      ord.items?.forEach(it => {
        if (!counts[it.name]) {
          counts[it.name] = { name: it.name, units: 0, revenue: 0 };
        }
        counts[it.name].units += it.quantity;
        counts[it.name].revenue += it.total || (it.price * it.quantity);
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
      .map((item, idx) => ({ rank: idx + 1, ...item }));
  }, [scopedOrders]);

  // Channel breakdown aggregated from actual orders
  const channels = useMemo(() => {
    const totalCount = scopedOrders.length || 1;
    const delivery = scopedOrders.filter(o => o.channel?.toLowerCase().includes('delivery'));
    const dineIn = scopedOrders.filter(o => o.channel?.toLowerCase().includes('dine'));
    const takeaway = scopedOrders.filter(o => o.channel?.toLowerCase().includes('takeaway'));

    return [
      { 
        name: 'Delivery', 
        orders: delivery.length, 
        amount: delivery.reduce((s, o) => s + o.total, 0), 
        percent: scopedOrders.length > 0 ? Math.round((delivery.length / totalCount) * 100) : 0, 
        color: 'bg-orange-500' 
      },
      { 
        name: 'Dine In', 
        orders: dineIn.length, 
        amount: dineIn.reduce((s, o) => s + o.total, 0), 
        percent: scopedOrders.length > 0 ? Math.round((dineIn.length / totalCount) * 100) : 0, 
        color: 'bg-orange-600' 
      },
      { 
        name: 'Takeaway', 
        orders: takeaway.length, 
        amount: takeaway.reduce((s, o) => s + o.total, 0), 
        percent: scopedOrders.length > 0 ? Math.round((takeaway.length / totalCount) * 100) : 0, 
        color: 'bg-amber-600' 
      },
    ];
  }, [scopedOrders]);

  // Last 7 days dynamic dates
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      const daySales = scopedOrders.filter(o => o.createdAt?.startsWith(str)).reduce((s, o) => s + o.total, 0);
      days.push({ date: str, sales: daySales });
    }
    return days;
  }, [scopedOrders]);

  const maxSale = Math.max(100, ...last7Days.map(d => d.sales));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Multi-Shop Quick Bar & Banner */}
      {currentUser?.role === 'OWNER' && (
        <div className="bg-[#141924] p-3 sm:p-4 rounded-2xl border border-[#232c3f] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              SWITCH OUTLET VIEW:
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

          <button
            onClick={() => openModal('shopManager')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outlet</span>
          </button>
        </div>
      )}

      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#171d29] to-[#121620] p-4 sm:p-5 rounded-2xl border border-[#232c3d]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              {activeShopId === 'all' 
                ? 'Enterprise Multi-Outlet Operations' 
                : `${activeShop?.name || 'Cafe'} Operations`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{activeShopId === 'all' ? 'Consolidated Live' : 'Outlet Live'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeShopId === 'all'
              ? `Unified multi-outlet metrics across all ${shops.length} cafe branches in network.`
              : `Operating metrics for ${activeShop?.name} (${activeShop?.code}) • ${activeShop?.city}.`}
          </p>
        </div>

        <button
          onClick={() => setActiveView('pos')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start md:self-auto active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>OPEN POS TERMINAL</span>
        </button>
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38] relative overflow-hidden group hover:border-[#2f3a4e] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {activeShopId === 'all' ? 'All Outlets Revenue' : 'Outlet Revenue Today'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ₹{todaySales.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                Live
              </span>
              <span className="text-slate-500">• {todayOrders.length} orders punched</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38] relative overflow-hidden group hover:border-[#2f3a4e] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {scopedOrders.length}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Avg Order Value:</span>
              <span className="text-slate-300 font-semibold font-mono">₹{aov}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Outlets / Registered Staff */}
        <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38] relative overflow-hidden group hover:border-[#2f3a4e] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {activeShopId === 'all' ? 'Active Branches' : 'Outlet Staff'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              {activeShopId === 'all' ? <Store className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {activeShopId === 'all' ? shops.length : staff.filter(s => s.shopId === activeShopId).length}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Status:</span>
              <span className="text-emerald-400 font-semibold">100% Operational</span>
            </div>
          </div>
        </div>

        {/* Card 4: Operating Expenses */}
        <div className="bg-[#151a24] p-4 rounded-2xl border border-[#222a38] relative overflow-hidden group hover:border-[#2f3a4e] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Recorded Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              <span className="text-slate-400">{scopedExpenses.length} entries tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* OWNER MULTI-OUTLET PERFORMANCE MATRIX (Visible to Owner) */}
      {currentUser?.role === 'OWNER' && (
        <div className="bg-[#151a24] p-4 sm:p-5 rounded-2xl border border-[#222a38] space-y-4">
          <div className="flex items-center justify-between border-b border-[#21293a] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Store className="w-4 h-4 text-orange-400" />
                <span>Outlets Performance & Switcher Hub</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of all {shops.length} cafe shops with quick switch actions
              </p>
            </div>
            <button
              onClick={() => openModal('shopManager')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1"
            >
              <span>Manage Outlets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shops.map((shop) => {
              const shopOrders = orders.filter(o => o.shopId === shop.id);
              const shopSales = shopOrders.reduce((s, o) => s + o.total, 0);
              const shopStaffMembers = staff.filter(s => s.shopId === shop.id);
              const isSelected = activeShopId === shop.id;

              return (
                <div
                  key={shop.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/40'
                      : 'bg-[#181f2c] border-[#252f42] hover:border-[#35435e]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white">{shop.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10141d] text-orange-400 border border-[#283244]">
                            {shop.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{shop.address || shop.city}</span>
                        </p>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500 text-white shadow-sm">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#222b3c] text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">TOTAL REVENUE</span>
                        <span className="font-extrabold text-white font-mono">₹{shopSales.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">INVOICES PUNCHED</span>
                        <span className="font-extrabold text-white font-mono">{shopOrders.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222b3c] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {shopStaffMembers.length} staff member{shopStaffMembers.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => switchShop(shop.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-orange-500/20 text-orange-400 cursor-default'
                          : 'bg-[#20293b] hover:bg-orange-500 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Active Now' : 'Switch to Shop'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle Row: Payment Mode Breakdown & Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Breakdown */}
        <div className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Payment Collections</h3>
              <p className="text-xs text-slate-400">UPI, Cash, Card & Split breakdown</p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              ₹{totalPayAmount.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { mode: 'UPI / Dynamic QR', amount: paymentBreakdown.Upi, color: 'bg-emerald-500' },
              { mode: 'Cash at Counter', amount: paymentBreakdown.Cash, color: 'bg-amber-500' },
              { mode: 'Card POS Swipe', amount: paymentBreakdown.Card, color: 'bg-blue-500' },
              { mode: 'Split Payment', amount: paymentBreakdown.Split, color: 'bg-purple-500' }
            ].map((p) => {
              const pct = totalPayAmount > 0 ? Math.round((p.amount / totalPayAmount) * 100) : 0;
              return (
                <div key={p.mode} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{p.mode}</span>
                    <span className="font-mono font-bold text-white">₹{p.amount.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1e2634] rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-[#151a24] p-5 rounded-2xl border border-[#222a38] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Sales Trajectory</h3>
              <p className="text-xs text-slate-400">Dynamic revenue chart from IndexedDB database</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">Active</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-[#222a38]">
            {last7Days.map((d) => {
              const heightPct = Math.max(8, Math.round((d.sales / maxSale) * 100));
              const label = new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' });
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ₹{d.sales}
                  </div>
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-lg group-hover:from-orange-500 group-hover:to-amber-400 transition-all shadow-md shadow-orange-950/20"
                  ></div>
                  <span className="text-[11px] font-medium text-slate-400 mt-2">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Best Sellers & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Top Menu Favorites</h3>
            <span className="text-xs text-slate-400">{bestSellers.length} items sold</span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No orders punched yet. Punch items in POS billing to view top items!
            </div>
          ) : (
            <div className="space-y-2.5">
              {bestSellers.map(item => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#181f2c] border border-[#242e40] text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-[10px] flex items-center justify-center">
                      #{item.rank}
                    </span>
                    <span className="font-bold text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white">₹{item.revenue.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{item.units} sold</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Channels */}
        <div className="bg-[#151a24] p-5 rounded-2xl border border-[#222a38] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Channel Distribution</h3>
            <span className="text-xs text-slate-400">Dine-In vs Takeaway vs Delivery</span>
          </div>

          <div className="space-y-3 pt-2">
            {channels.map(ch => (
              <div key={ch.name} className="p-3 rounded-xl bg-[#181f2c] border border-[#242e40] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{ch.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{ch.orders} orders ({ch.percent}%)</div>
                </div>
                <div className="text-right font-mono font-bold text-white text-xs">
                  ₹{ch.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
