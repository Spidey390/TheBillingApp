import React, { useMemo } from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  Grid2X2,
  Users, 
  Utensils,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isTableOccupied } from '../../domain/tables';
import { businessDate, shiftDate } from '../../domain/dates';

function MetricCard({ label, value, detail, icon: Icon, color, onClick }) {
  const Card = onClick ? 'button' : 'div';
  return (
    <Card type={onClick ? 'button' : undefined} onClick={onClick}
      className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-1 gap-y-1 rounded-xl border border-[#232a39] bg-[#171c26] p-3 text-left sm:p-4 ${onClick ? 'hover:border-orange-500/40 hover:bg-[#1d2330]' : ''}`}>
      <span className="self-center text-xs font-medium text-slate-300">{label}</span>
      <span className={`grid size-7 place-items-center rounded-lg sm:size-9 ${color}`}>
        <Icon className="size-4 sm:size-5" aria-hidden="true" />
      </span>
      <span className="col-span-2 break-words text-lg font-bold tabular-nums text-white sm:text-xl">{value}</span>
      {detail && <span className="col-span-2 text-xs text-slate-400">{detail}</span>}
    </Card>
  );
}

export default function OperationsDashboard() {
  const { setActiveView, orders, expenses, customers, products, tables, isOwner } = useApp();

  // Calculate real values from state
  const todayStr = businessDate();
  const completedOrders = useMemo(() => orders.filter(order => order.status === 'Completed'), [orders]);
  const todayOrders = useMemo(() => completedOrders.filter(order =>
    businessDate(order.createdAt) === todayStr), [completedOrders, todayStr]);
  const summaryOrders = isOwner ? completedOrders : todayOrders;
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const aov = todayOrders.length ? (todaySales / todayOrders.length).toFixed(1) : '0.0';
  const totalExpenses = expenses.filter(expense => businessDate(expense.createdAt || expense.date) === todayStr)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const todayRefunds = completedOrders.filter(order => order.refund && businessDate(order.refund.recordedAt) === todayStr);
  const excludingTax = (total, order) => total + order.total - (order.cgst || 0) - (order.sgst || 0);
  const dailyBalance = todayOrders.reduce(excludingTax, 0) - todayRefunds.reduce(excludingTax, 0) - totalExpenses;
  const occupiedTables = (tables || []).filter(isTableOccupied).length;

  // Breakdown by payment - accurately distributes split payments into Cash and UPI
  const paymentBreakdown = useMemo(() => {
    let card = 0;
    let cash = 0;
    let upi = 0;
    let unknown = 0;

    summaryOrders.forEach(o => {
      const total = Number(o.total || 0);
      if (o.paymentMethod === 'Card') {
        card += total;
      } else if (o.paymentMethod === 'Cash') {
        cash += total;
      } else if (o.paymentMethod === 'UPI') {
        upi += total;
      } else if (o.paymentMethod === 'Split') {
        if (o.splitBreakdown) {
          cash += Number(o.splitBreakdown.cash || 0);
          upi += Number(o.splitBreakdown.upi || 0);
          if (o.splitBreakdown.card) card += Number(o.splitBreakdown.card || 0);
        } else {
          unknown += total;
        }
      } else {
        unknown += total;
      }
    });

    return { Card: card, Cash: cash, Upi: upi, Unallocated: unknown };
  }, [summaryOrders]);

  const totalPayAmount = paymentBreakdown.Card + paymentBreakdown.Cash + paymentBreakdown.Upi + paymentBreakdown.Unallocated;

  // Best selling items aggregated from actual orders
  const bestSellers = useMemo(() => {
    const counts = {};
    summaryOrders.forEach(ord => {
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
  }, [summaryOrders]);

  // Channel breakdown aggregated from actual orders
  const channels = useMemo(() => {
    const totalCount = completedOrders.length || 1;
    const delivery = completedOrders.filter(o => o.channel?.toLowerCase().includes('delivery'));
    const dineIn = completedOrders.filter(o => o.channel?.toLowerCase().includes('dine'));
    const takeaway = completedOrders.filter(o => o.channel?.toLowerCase().includes('takeaway'));

    return [
      { 
        name: 'Delivery', 
        orders: delivery.length, 
        amount: delivery.reduce((s, o) => s + o.total, 0), 
        percent: completedOrders.length > 0 ? Math.round((delivery.length / totalCount) * 100) : 0,
        color: 'bg-orange-500' 
      },
      { 
        name: 'Dine In', 
        orders: dineIn.length, 
        amount: dineIn.reduce((s, o) => s + o.total, 0), 
        percent: completedOrders.length > 0 ? Math.round((dineIn.length / totalCount) * 100) : 0,
        color: 'bg-orange-600' 
      },
      { 
        name: 'Takeaway', 
        orders: takeaway.length, 
        amount: takeaway.reduce((s, o) => s + o.total, 0), 
        percent: completedOrders.length > 0 ? Math.round((takeaway.length / totalCount) * 100) : 0,
        color: 'bg-amber-600' 
      },
    ];
  }, [completedOrders]);

  // Last 7 days dynamic dates
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const str = shiftDate(todayStr, -i);
      const daySales = completedOrders.filter(o => businessDate(o.createdAt) === str).reduce((s, o) => s + o.total, 0);
      days.push({ date: str, sales: daySales });
    }
    return days;
  }, [completedOrders, todayStr]);

  const maxSale = Math.max(100, ...last7Days.map(d => d.sales));
  const chartTop = 20;
  const chartBottom = 180;
  const chartMiddle = (chartTop + chartBottom) / 2;
  const revenuePoints = last7Days.map(({ date, sales }, index) => ({
    date,
    x: 50 + index * 70,
    y: chartBottom - (sales / maxSale) * (chartBottom - chartTop)
  }));

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-4 app-gutters py-4 sm:space-y-6 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-2.5">
        <h1 className="text-xl font-extrabold text-white">{isOwner ? 'Dashboard' : 'Staff Dashboard'}</h1>
        {isOwner && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Live
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <MetricCard label="Today's sales" value={`₹${todaySales.toFixed(2)}`} icon={IndianRupee}
          detail={isOwner ? `Avg. bill ₹${aov}` : undefined} color="bg-emerald-500/10 text-emerald-400" />
        <MetricCard label="Today's orders" value={todayOrders.length} icon={ShoppingBag}
          detail="Completed bills" color="bg-orange-500/10 text-orange-400" onClick={() => setActiveView('orders')} />
        {isOwner && (
          <MetricCard label="Sales less expenses" value={`₹${dailyBalance.toFixed(2)}`} icon={TrendingUp}
            detail="After refunds and recorded taxes" color="bg-teal-500/10 text-teal-400" />
        )}
        <MetricCard label="Today's expenses" value={`₹${totalExpenses.toFixed(2)}`} icon={Wallet}
          detail={!isOwner ? 'Your cash expenses' : undefined} color="bg-rose-500/10 text-rose-400"
          onClick={() => setActiveView('expenses')} />
        <MetricCard label="Occupied tables" value={`${occupiedTables} / ${tables.length}`} icon={Grid2X2}
          color="bg-orange-500/10 text-orange-400" onClick={() => setActiveView('tables')} />
        {isOwner && (
          <>
            <MetricCard label="Customers" value={customers.length} icon={Users} color="bg-purple-500/10 text-purple-400" />
            <MetricCard label="Active products" value={products.length} icon={Utensils} color="bg-indigo-500/10 text-indigo-400" />
          </>
        )}
      </div>

      <div className={isOwner ? 'space-y-4 sm:space-y-6' : 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2'}>
      <div className={isOwner ? 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12' : 'contents'}>
        {isOwner && (
          <>
            {/* Revenue Trend Line Chart */}
            <div className="lg:col-span-7 bg-[#171c26] p-3.5 sm:p-5 rounded-xl border border-[#232a39] flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Revenue Trend (Last 7 Days)</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Daily sales collection volume</p>
              </div>

              <div className="relative mt-3 flex h-36 w-full items-end sm:h-56">
                {totalPayAmount === 0 ? (
                  <div className="flex h-full w-full flex-col items-center justify-center text-center text-xs text-slate-400">
                    <TrendingUp className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                    <span>No sales recorded yet</span>
                  </div>
                ) : (
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    <line x1="40" y1={chartTop} x2="480" y2={chartTop} stroke="#252f40" strokeDasharray="3 3" />
                    <text x="35" y={chartTop + 4} fill="#64748b" fontSize="9" textAnchor="end">₹{Math.round(maxSale)}</text>

                    <line x1="40" y1={chartMiddle} x2="480" y2={chartMiddle} stroke="#252f40" strokeDasharray="3 3" />
                    <text x="35" y={chartMiddle + 4} fill="#64748b" fontSize="9" textAnchor="end">₹{Math.round(maxSale / 2)}</text>

                    <line x1="40" y1={chartBottom} x2="480" y2={chartBottom} stroke="#252f40" />
                    <text x="35" y={chartBottom + 4} fill="#64748b" fontSize="9" textAnchor="end">₹0</text>

                    <polyline points={revenuePoints.map(({ x, y }) => `${x},${y}`).join(' ')}
                      fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round"
                      strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    {revenuePoints.map(({ date, x, y }) => (
                      <g key={date}>
                        <circle cx={x} cy={y} r="4" fill="#f97316" />
                        <text x={x} y="196" fill="#64748b" fontSize="8" textAnchor="middle">
                          {date.slice(5)}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </div>
          </>
        )}
        {/* Sales by Payment Method Donut */}
        <div className={`min-w-0 bg-[#171c26] p-3.5 sm:p-5 rounded-xl border border-[#232a39] flex flex-col justify-between ${isOwner ? 'lg:col-span-5' : ''}`}>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sales by Payment Method</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{isOwner ? 'Completed sales · all dates' : 'Completed sales today'}</p>
          </div>

          <div className="my-4 flex flex-wrap items-center justify-around gap-4">
            {/* SVG Donut */}
            <div className="relative size-28 shrink-0 sm:size-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1f2838" strokeWidth="5.5" />
                {totalPayAmount > 0 && (
                  <>
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="5.5"
                      strokeDasharray={`${(paymentBreakdown.Card / totalPayAmount) * 88} 88`} strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="5.5"
                      strokeDasharray={`${(paymentBreakdown.Cash / totalPayAmount) * 88} 88`} strokeDashoffset={`-${(paymentBreakdown.Card / totalPayAmount) * 88}`} />
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="5.5"
                      strokeDasharray={`${(paymentBreakdown.Upi / totalPayAmount) * 88} 88`} strokeDashoffset={`-${((paymentBreakdown.Card + paymentBreakdown.Cash) / totalPayAmount) * 88}`} />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-xs font-black text-white font-mono">₹{totalPayAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="min-w-0 space-y-2 text-xs">
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
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-400">UPI</span>
                <span className="text-white font-mono font-medium ml-auto">₹{paymentBreakdown.Upi.toFixed(2)}</span>
              </div>
              {paymentBreakdown.Unallocated > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Unallocated</span>
                  <span className="ml-auto font-mono">₹{paymentBreakdown.Unallocated.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={isOwner ? 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12' : 'contents'}>
        {/* Top 5 Items */}
        <div className={`min-w-0 bg-[#171c26] p-3.5 sm:p-5 rounded-xl border border-[#232a39] ${isOwner ? 'lg:col-span-7' : ''}`}>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Top 5 Best Selling Cafe Items</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{isOwner ? 'Ranked by units sold' : 'Ranked by units sold today'}</p>

          <div className="mt-4 space-y-2.5">
            {bestSellers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {isOwner ? 'No items sold yet.' : 'No items sold today.'}
              </div>
            ) : (
              bestSellers.map(item => (
                <div key={item.rank} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-[#131720] border border-[#212837] hover:border-[#2f394e] transition-colors">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="w-6 h-6 shrink-0 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center">
                      #{item.rank}
                    </span>
                    <div>
                      <h3 className="break-words text-xs font-bold text-slate-200">{item.name}</h3>
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

        {isOwner && (
          <>
            {/* Order Channel */}
            <div className="lg:col-span-5 bg-[#171c26] p-3.5 sm:p-5 rounded-xl border border-[#232a39] flex flex-col justify-between">
              <h2 className="text-sm font-semibold text-white">Sales by order channel</h2>
              <ul className="mt-4 space-y-4">
                {channels.map(channel => (
                  <li key={channel.name} className="space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200">{channel.name === 'Dine In' ? 'Dine-in' : channel.name}</p>
                        <p className="text-xs text-slate-400">{channel.orders} {channel.orders === 1 ? 'order' : 'orders'}</p>
                      </div>
                      <div className="min-w-0 break-words text-right tabular-nums">
                        <p className="text-sm font-bold text-slate-100">₹{channel.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-400">{channel.percent}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#111620]" aria-hidden="true">
                      <div className={`h-full rounded-full ${channel.color}`} style={{ width: `${channel.percent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-end border-t border-[#232a39] pt-1.5">
                <button type="button" onClick={() => setActiveView('tables')}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10">
                  View tables <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  );
}
