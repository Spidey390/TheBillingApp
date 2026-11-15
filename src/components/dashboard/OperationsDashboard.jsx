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
  Utensils 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OperationsDashboard() {
  const { setActiveView, orders, expenses, customers, products, rawMaterials } = useApp();

  // Calculate real values from state
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => 
    o.createdAt?.startsWith(todayStr) || 
    (o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString())
  );
  
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(1) : '0.0';
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const lowStockCount = rawMaterials.filter(r => r.currentStock <= r.minThreshold).length;

  // Breakdown by payment
  const paymentBreakdown = {
    Card: orders.filter(o => o.paymentMethod === 'Card').reduce((s, o) => s + o.total, 0),
    Cash: orders.filter(o => o.paymentMethod === 'Cash').reduce((s, o) => s + o.total, 0),
    Split: orders.filter(o => o.paymentMethod === 'Split').reduce((s, o) => s + o.total, 0),
    Upi: orders.filter(o => o.paymentMethod === 'UPI').reduce((s, o) => s + o.total, 0)
  };
  const totalPayAmount = paymentBreakdown.Card + paymentBreakdown.Cash + paymentBreakdown.Split + paymentBreakdown.Upi;

  // Best selling items aggregated from actual orders
  const bestSellers = useMemo(() => {
    const counts = {};
    orders.forEach(ord => {
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
  }, [orders]);

  // Channel breakdown aggregated from actual orders
  const channels = useMemo(() => {
    const totalCount = orders.length || 1;
    const delivery = orders.filter(o => o.channel?.toLowerCase().includes('delivery'));
    const dineIn = orders.filter(o => o.channel?.toLowerCase().includes('dine'));
    const takeaway = orders.filter(o => o.channel?.toLowerCase().includes('takeaway'));

    return [
      { 
        name: 'Delivery', 
        orders: delivery.length, 
        amount: delivery.reduce((s, o) => s + o.total, 0), 
        percent: orders.length > 0 ? Math.round((delivery.length / totalCount) * 100) : 0, 
        color: 'bg-orange-500' 
      },
      { 
        name: 'Dine In', 
        orders: dineIn.length, 
        amount: dineIn.reduce((s, o) => s + o.total, 0), 
        percent: orders.length > 0 ? Math.round((dineIn.length / totalCount) * 100) : 0, 
        color: 'bg-orange-600' 
      },
      { 
        name: 'Takeaway', 
        orders: takeaway.length, 
        amount: takeaway.reduce((s, o) => s + o.total, 0), 
        percent: orders.length > 0 ? Math.round((takeaway.length / totalCount) * 100) : 0, 
        color: 'bg-amber-600' 
      },
    ];
  }, [orders]);

  // Last 7 days dynamic dates
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      const daySales = orders.filter(o => o.createdAt?.startsWith(str)).reduce((s, o) => s + o.total, 0);
      days.push({ date: str, sales: daySales });
    }
    return days;
  }, [orders]);

  const maxSale = Math.max(100, ...last7Days.map(d => d.sales));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#171d29] to-[#121620] p-5 rounded-2xl border border-[#232c3d]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-extrabold text-white">Cafe Operations Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Real-Time</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track daily billing revenue, live orders, ingredient stock alerts, and expenses.
          </p>
        </div>
        <button
          onClick={() => setActiveView('pos')}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start md:self-auto"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Open POS Billing</span>
        </button>
      </div>

      {/* KPI Stat Cards (2 rows of 4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Today's Sales</span>
            <div className="text-xl font-black text-white mt-1">
              ₹{todaySales.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              AOV: ₹{aov}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Today's Orders */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Today's Orders</span>
            <div className="text-xl font-black text-white mt-1">
              {todayOrders.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Bills Completed
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Est. Daily Profit */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Est. Daily Profit</span>
            <div className="text-xl font-black text-teal-400 mt-1">
              ₹{Math.max(0, todaySales * 0.65).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Gross Margin ~65%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Today's Expenses */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Today's Expenses</span>
            <div className="text-xl font-black text-rose-400 mt-1">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Operational Outflow
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Active / Kitchen Prep */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active / Kitchen Prep</span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {orders.filter(o => o.status === 'Preparing' || o.status === 'New').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">In Preparation</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 6: Low Stock Alerts */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Low Stock Alerts</span>
            <div className={`text-xl font-black mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {lowStockCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Needs Reordering</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 7: Total Customers */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Customers</span>
            <div className="text-xl font-black text-purple-400 mt-1">{customers.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered in CRM</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 8: Active Products */}
        <div className="bg-[#171c26] p-4 rounded-xl border border-[#232a39] flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Products</span>
            <div className="text-xl font-black text-indigo-400 mt-1">{products.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Menu Catalog (Protected)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Utensils className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Revenue Trend & Payment Method Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-7 bg-[#171c26] p-5 rounded-xl border border-[#232a39] flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Revenue Trend (Last 7 Days)</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Daily sales collection volume</p>
          </div>

          <div className="mt-4 h-56 relative w-full flex items-end">
            {totalPayAmount === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <TrendingUp className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                <span>No sales recorded yet</span>
                <span className="text-[11px] text-slate-600 mt-0.5">Billing orders at POS terminal will plot real-time trend here</span>
              </div>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#252f40" strokeDasharray="3 3" />
                <text x="35" y="24" fill="#64748b" fontSize="9" textAnchor="end">₹{Math.round(maxSale)}</text>

                <line x1="40" y1="100" x2="480" y2="100" stroke="#252f40" strokeDasharray="3 3" />
                <text x="35" y="104" fill="#64748b" fontSize="9" textAnchor="end">₹{Math.round(maxSale / 2)}</text>

                <line x1="40" y1="180" x2="480" y2="180" stroke="#252f40" />
                <text x="35" y="184" fill="#64748b" fontSize="9" textAnchor="end">₹0</text>

                {/* Plot Points */}
                {last7Days.map((d, i) => {
                  const x = 50 + (i * 70);
                  const y = 180 - ((d.sales / maxSale) * 150);
                  return (
                    <g key={d.date}>
                      <circle cx={x} cy={y} r="4" fill="#f97316" />
                      <text x={x} y="196" fill="#64748b" fontSize="8" textAnchor="middle">
                        {d.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Sales by Payment Method Donut */}
        <div className="lg:col-span-5 bg-[#171c26] p-5 rounded-xl border border-[#232a39] flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sales by Payment Method</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Cash vs UPI vs Card breakdown</p>
          </div>

          <div className="my-4 flex items-center justify-around">
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1f2838" strokeWidth="5.5" />
                {totalPayAmount > 0 && (
                  <>
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="5.5" 
                      strokeDasharray={`${(paymentBreakdown.Card / totalPayAmount) * 88} 88`} strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="5.5" 
                      strokeDasharray={`${(paymentBreakdown.Cash / totalPayAmount) * 88} 88`} strokeDashoffset={`-${(paymentBreakdown.Card / totalPayAmount) * 88}`} />
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#14b8a6" strokeWidth="5.5" 
                      strokeDasharray={`${(paymentBreakdown.Split / totalPayAmount) * 88} 88`} strokeDashoffset={`-${((paymentBreakdown.Card + paymentBreakdown.Cash) / totalPayAmount) * 88}`} />
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="5.5" 
                      strokeDasharray={`${(paymentBreakdown.Upi / totalPayAmount) * 88} 88`} strokeDashoffset={`-${((paymentBreakdown.Card + paymentBreakdown.Cash + paymentBreakdown.Split) / totalPayAmount) * 88}`} />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-xs font-black text-white font-mono">₹{totalPayAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-400">Card</span>
                <span className="text-white font-mono font-medium ml-auto">₹{paymentBreakdown.Card.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-400">Cash</span>
                <span className="text-white font-mono font-medium ml-auto">₹{paymentBreakdown.Cash.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <span className="text-slate-400">Split</span>
                <span className="text-white font-mono font-medium ml-auto">₹{paymentBreakdown.Split.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-400">Upi</span>
                <span className="text-white font-mono font-medium ml-auto">₹{paymentBreakdown.Upi.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top 5 Best Selling Cafe Items & Sales by Order Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Items */}
        <div className="lg:col-span-7 bg-[#171c26] p-5 rounded-xl border border-[#232a39]">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Top 5 Best Selling Cafe Items</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Ranked by order volume & popularity</p>

          <div className="mt-4 space-y-2.5">
            {bestSellers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No orders processed yet. Items sold at POS will rank here automatically.
              </div>
            ) : (
              bestSellers.map(item => (
                <div key={item.rank} className="flex items-center justify-between p-3 rounded-lg bg-[#131720] border border-[#212837] hover:border-[#2f394e] transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center">
                      #{item.rank}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">{item.name}</h3>
                      <span className="text-[10px] text-slate-400">{item.units} units sold</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    ₹{item.revenue.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Channel */}
        <div className="lg:col-span-5 bg-[#171c26] p-5 rounded-xl border border-[#232a39] flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sales by Order Channel</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Dine-in tables vs Counter takeaway vs Delivery</p>
          </div>

          <div className="mt-4 space-y-4">
            {channels.map(ch => (
              <div key={ch.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{ch.name} ({ch.orders} Orders)</span>
                  <span className="text-slate-200 font-bold font-mono">₹{ch.amount.toFixed(2)} ({ch.percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#131720] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ch.color}`}
                    style={{ width: `${ch.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-3 border-t border-[#232a39] flex items-center justify-between text-[11px] text-slate-400">
            <span>Dine-In channel driving customer experience</span>
            <span className="text-orange-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveView('tables')}>
              View Floor Plan →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
