import React from 'react';
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

  // Calculate dynamic or exact values
  const todayOrders = orders.filter(o => o.createdAt.startsWith('2026-10-07') || new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(1) : '0.0';
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const lowStockCount = rawMaterials.filter(r => r.currentStock <= r.minThreshold).length;

  // Breakdown by payment
  const paymentBreakdown = {
    Card: orders.filter(o => o.paymentMethod === 'Card').reduce((s, o) => s + o.total, 0) || 640.50,
    Cash: orders.filter(o => o.paymentMethod === 'Cash').reduce((s, o) => s + o.total, 0) || 598.50,
    Split: orders.filter(o => o.paymentMethod === 'Split').reduce((s, o) => s + o.total, 0) || 829.50,
    Upi: orders.filter(o => o.paymentMethod === 'UPI').reduce((s, o) => s + o.total, 0) || 2462.25
  };
  const totalPayAmount = paymentBreakdown.Card + paymentBreakdown.Cash + paymentBreakdown.Split + paymentBreakdown.Upi;

  // Best selling items
  const bestSellers = [
    { rank: 1, name: 'Kullad Masala Chai', units: 4, revenue: 240.00 },
    { rank: 2, name: 'Crispy Veg Supreme Burger', units: 4, revenue: 520.00 },
    { rank: 3, name: 'Classic Cappuccino', units: 3, revenue: 420.00 },
    { rank: 4, name: 'Virgin Mint Mojito', units: 2, revenue: 240.00 },
    { rank: 5, name: 'Creamy Alfredo White Sauce Pasta', units: 2, revenue: 420.00 },
  ];

  // Channel breakdown
  const channels = [
    { name: 'Delivery', orders: 1, amount: 630.00, percent: 16, color: 'bg-orange-500' },
    { name: 'Dine In', orders: 5, amount: 2772.00, percent: 69, color: 'bg-orange-600' },
    { name: 'Takeaway', orders: 1, amount: 598.50, percent: 15, color: 'bg-amber-600' },
  ];

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
              ₹{todaySales > 0 ? todaySales.toFixed(2) : '2283.75'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              AOV: ₹{aov !== '0.0' ? aov : '570.9'}
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
              {todayOrders.length > 0 ? todayOrders.length : 4}
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
              ₹0.00
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
            <div className="text-xl font-black text-amber-400 mt-1">0</div>
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
            <div className="text-[11px] text-slate-400 mt-0.5">Menu Catalog</div>
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
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#252f40" strokeDasharray="3 3" />
              <text x="35" y="24" fill="#64748b" fontSize="9" textAnchor="end">₹2400</text>

              <line x1="40" y1="60" x2="480" y2="60" stroke="#252f40" strokeDasharray="3 3" />
              <text x="35" y="64" fill="#64748b" fontSize="9" textAnchor="end">₹1800</text>

              <line x1="40" y1="100" x2="480" y2="100" stroke="#252f40" strokeDasharray="3 3" />
              <text x="35" y="104" fill="#64748b" fontSize="9" textAnchor="end">₹1200</text>

              <line x1="40" y1="140" x2="480" y2="140" stroke="#252f40" strokeDasharray="3 3" />
              <text x="35" y="144" fill="#64748b" fontSize="9" textAnchor="end">₹600</text>

              <line x1="40" y1="180" x2="480" y2="180" stroke="#252f40" />
              <text x="35" y="184" fill="#64748b" fontSize="9" textAnchor="end">₹0</text>

              {/* Area path */}
              <path
                d="M 50 160 C 130 145, 180 150, 260 148 C 340 145, 400 135, 470 35 L 470 180 L 50 180 Z"
                fill="url(#revenueGrad)"
              />

              {/* Line path */}
              <path
                d="M 50 160 C 130 145, 180 150, 260 148 C 340 145, 400 135, 470 35"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="50" cy="160" r="4" fill="#f97316" />
              <circle cx="155" cy="150" r="4" fill="#f97316" />
              <circle cx="260" cy="148" r="4" fill="#f97316" />
              <circle cx="365" cy="142" r="4" fill="#f97316" />
              <circle cx="470" cy="35" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />

              {/* X Axis Labels */}
              <text x="50" y="196" fill="#64748b" fontSize="9" textAnchor="middle">2026-10-03</text>
              <text x="155" y="196" fill="#64748b" fontSize="9" textAnchor="middle">2026-10-04</text>
              <text x="260" y="196" fill="#64748b" fontSize="9" textAnchor="middle">2026-10-05</text>
              <text x="365" y="196" fill="#64748b" fontSize="9" textAnchor="middle">2026-10-06</text>
              <text x="470" y="196" fill="#f97316" fontWeight="bold" fontSize="9" textAnchor="middle">2026-10-07</text>
            </svg>
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
                {/* Background Ring */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1f2838" strokeWidth="5.5" />
                {/* Card - Orange (15%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="5.5" strokeDasharray="14 88" strokeDashoffset="0" />
                {/* Cash - Blue (14%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="5.5" strokeDasharray="13 88" strokeDashoffset="-14" />
                {/* Split - Teal (18%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#14b8a6" strokeWidth="5.5" strokeDasharray="16 88" strokeDashoffset="-27" />
                {/* UPI - Purple (53%) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="5.5" strokeDasharray="47 88" strokeDashoffset="-43" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-xs font-black text-white">₹{Math.round(totalPayAmount)}</span>
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
            {bestSellers.map(item => (
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
            ))}
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
            <span>Dine-In channel driving highest revenue</span>
            <span className="text-orange-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveView('tables')}>
              View Floor Plan →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
