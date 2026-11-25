import React, { useState, useMemo } from 'react';
import { Printer, Download, Utensils, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { businessDate, dateRange as rangeFor, inRange } from '../../domain/dates';
import DayCalendarPicker from './DayCalendarPicker';

export default function BusinessReports() {
  const { orders, expenses, products, showToast } = useApp();

  const [dateRange, setDateRange] = useState('Today'); // 'Today', 'Yesterday', 'Specific Day', 'Last 7 Days', 'Last 30 Days', 'Custom Range'
  const ranges = ['Today', 'Yesterday', 'Specific Day', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

  const today = businessDate();
  const [specificDate, setSpecificDate] = useState(today);
  const [custom, setCustom] = useState({ start: today, end: today });
  const [start, end] = rangeFor(dateRange, today, { ...custom, date: specificDate });
  const rangeValid = start <= end;

  const [dishSearch, setDishSearch] = useState('');
  const [dishSort, setDishSort] = useState('units'); // 'units' | 'revenue' | 'name'

  const completedOrders = useMemo(() => orders.filter(order =>
    order.status === 'Completed' && inRange(businessDate(order.createdAt), [start, end])
  ), [orders, start, end]);
  const refunds = useMemo(() => orders.filter(order =>
    order.refund && inRange(businessDate(order.refund.recordedAt), [start, end])
  ), [orders, start, end]);
  const refundedTotal = refunds.reduce((total, order) => total + order.refund.amount, 0);
  const grossSales = completedOrders.reduce((total, order) => total + order.total, 0);
  const recordedTax = order => (order.cgst || 0) + (order.sgst || 0);
  const netRecordedTax = completedOrders.reduce((total, order) => total + recordedTax(order), 0) -
    refunds.reduce((total, order) => total + recordedTax(order), 0);
  const netSales = grossSales - refundedTotal - netRecordedTax;
  const totalExpenses = expenses.filter(expense => inRange(businessDate(expense.createdAt || expense.date), [start, end]))
    .reduce((total, expense) => total + expense.amount, 0);
  const estimatedNetProfit = netSales - totalExpenses;
  const catalog = useMemo(() => new Map(products.map(product => [product.id, product.category])), [products]);

  // Dish breakdown aggregated dynamically from actual orders
  const dishSales = useMemo(() => {
    const dishes = {};
    completedOrders.forEach(o => {
      o.items?.forEach(it => {
        const dishName = it.name || 'Unnamed Item';
        const catName = it.category || catalog.get(it.id) || 'Uncategorized';
        const variantSuffix = it.variant ? ` (${it.variant})` : '';
        const fullName = `${dishName}${variantSuffix}`;
        const key = `${it.id || it.productId || dishName}__${it.variant || ''}`;

        if (!dishes[key]) {
          dishes[key] = {
            id: it.id || it.productId || key,
            name: fullName,
            rawName: dishName,
            variant: it.variant || null,
            category: catName,
            units: 0,
            revenue: 0,
          };
        }
        const qty = Number(it.quantity || 0);
        dishes[key].units += qty;
        dishes[key].revenue += Number(it.total != null ? it.total : (it.price * qty));
      });
    });
    return Object.values(dishes);
  }, [completedOrders, catalog]);

  const totalUnitsSold = useMemo(() =>
    dishSales.reduce((acc, d) => acc + d.units, 0),
    [dishSales]
  );

  const filteredDishSales = useMemo(() => {
    let list = dishSales;
    if (dishSearch.trim()) {
      const q = dishSearch.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (dishSort === 'revenue') return b.revenue - a.revenue || b.units - a.units;
      if (dishSort === 'name') return a.name.localeCompare(b.name);
      return b.units - a.units || b.revenue - a.revenue;
    });
  }, [dishSales, dishSearch, dishSort]);

  // Category breakdown aggregated dynamically from actual orders
  const categorySales = useMemo(() => {
    const cats = {};
    completedOrders.forEach(o => {
      o.items?.forEach(it => {
        const catName = it.category || catalog.get(it.id) || 'Uncategorized';
        if (!cats[catName]) cats[catName] = { category: catName, units: 0, revenue: 0 };
        cats[catName].units += it.quantity;
        cats[catName].revenue += it.total || (it.price * it.quantity);
      });
    });
    return Object.values(cats).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders, catalog]);

  // Cashier ranking dynamically aggregated from actual orders
  const cashierSales = useMemo(() => {
    const staffSales = {};
    completedOrders.forEach(o => {
      const cName = o.cashierName || 'Counter Staff';
      if (!staffSales[cName]) staffSales[cName] = { name: cName, bills: 0, sales: 0 };
      staffSales[cName].bills += 1;
      staffSales[cName].sales += o.total;
    });
    return Object.values(staffSales).sort((a, b) => b.sales - a.sales);
  }, [completedOrders]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const escapeCsv = (str) => {
      const s = String(str ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const periodStr = start === end ? start : `${start} to ${end}`;
    const sortedDishes = [...dishSales].sort((a, b) => b.units - a.units || b.revenue - a.revenue);

    const lines = [
      `Sales Report,${escapeCsv(periodStr)}`,
      `Timezone,Asia/Kolkata (India Time)`,
      '',
      'FINANCIAL SUMMARY',
      'Metric,Value',
      `Gross Sales Revenue,₹${grossSales.toFixed(2)}`,
      `Refunds,₹${refundedTotal.toFixed(2)}`,
      `Operating Expenses,₹${totalExpenses.toFixed(2)}`,
      `Sales Less Recorded Expenses,₹${estimatedNetProfit.toFixed(2)}`,
      `Completed Orders,${completedOrders.length}`,
      `Total Dish Units Sold,${totalUnitsSold}`,
      '',
      'DISHES & ITEMS SOLD',
      'Rank,Dish Name,Variant,Category,Quantity Sold,Total Revenue (INR)',
      ...sortedDishes.map((d, idx) =>
        `${idx + 1},${escapeCsv(d.rawName)},${escapeCsv(d.variant || '')},${escapeCsv(d.category)},${d.units},${d.revenue.toFixed(2)}`
      ),
      '',
      'SALES BY CATEGORY',
      'Category,Units Sold,Revenue (INR)',
      ...categorySales.map(c =>
        `${escapeCsv(c.category)},${c.units},${c.revenue.toFixed(2)}`
      ),
      '',
      'CASHIER PERFORMANCE',
      'Cashier / Staff,Bills Generated,Sales (INR)',
      ...cashierSales.map(cs =>
        `${escapeCsv(cs.name)},${cs.bills},${cs.sales.toFixed(2)}`
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join('\n'));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    const filenameDate = start === end ? start : `${start}_to_${end}`;
    link.setAttribute("download", `sales-report-${filenameDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported');
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-4 app-gutters py-4 sm:space-y-6 sm:py-6" id="printable-report">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Business Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review sales, refunds, expenses, and cashier performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handlePrint} disabled={!rangeValid}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[#2b3548] bg-[#1b2230] px-3.5 text-xs font-bold text-slate-200 hover:bg-[#252f42] disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV} disabled={!rangeValid}
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div role="group" aria-label="Report date range"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-[#232b3a] bg-[#141923] p-1.5 sm:inline-flex sm:flex-wrap no-print">
        {ranges.map((r) => (
          <button
            key={r} type="button"
            onClick={() => setDateRange(r)} aria-pressed={dateRange === r}
            className={`min-h-11 rounded-xl px-2 py-1.5 text-sm font-semibold transition-colors sm:px-3 ${
              dateRange === r
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {dateRange === 'Specific Day' && (
        <DayCalendarPicker value={specificDate} onChange={setSpecificDate} />
      )}

      {dateRange === 'Custom Range' && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 no-print">
          {['start', 'end'].map(key => (
            <label key={key} className="min-w-0 text-xs font-medium text-slate-300">
              {key === 'start' ? 'Start date' : 'End date'}
              <input
                type="date"
                value={custom[key]}
                onChange={event => setCustom({ ...custom, [key]: event.target.value })}
                onClick={(e) => {
                  try { e.target.showPicker?.(); } catch {}
                }}
                style={{ colorScheme: 'dark' }}
                className="mt-1 block min-h-11 w-full min-w-0 cursor-pointer rounded-lg border border-slate-600 bg-slate-900 px-2 text-base text-slate-100"
              />
            </label>
          ))}
        </div>
      )}
      {rangeValid ? <p className="text-sm text-slate-300">{start === end ? `${start} · India time` : `${start} to ${end} · India time`}</p> :
        <p role="alert" className="text-sm text-rose-300">Start date must be on or before end date.</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gross Sales */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39]">
          <span className="text-xs text-slate-400 font-medium">Gross Sales Revenue</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{grossSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedOrders.length} Completed Orders
            {refundedTotal > 0 && <span className="block">Refunds ₹{refundedTotal.toFixed(2)}</span>}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39]">
          <span className="text-xs text-slate-400 font-medium">Operating Expenses</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            ₹{totalExpenses.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rent, Utilities, Supplies
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39]">
          <span className="text-xs text-slate-400 font-medium">Sales Less Recorded Expenses</span>
          <div className={`text-2xl font-black font-mono mt-1 ${estimatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{estimatedNetProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Net sales after refunds and recorded taxes, less expenses
          </div>
        </div>
      </div>

      {/* Dishes & Items Sold Section */}
      <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Dishes &amp; Items Sold
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {dishSales.length} {dishSales.length === 1 ? 'item' : 'items'} · {totalUnitsSold} total {totalUnitsSold === 1 ? 'unit' : 'units'} sold
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={dishSearch}
                onChange={e => setDishSearch(e.target.value)}
                placeholder="Search dishes or category…"
                className="w-full min-h-10 rounded-xl border border-[#2b3548] bg-[#121620] pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
              {dishSearch && (
                <button
                  type="button"
                  onClick={() => setDishSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center rounded-xl border border-[#2b3548] bg-[#121620] p-1 text-xs">
              <button
                type="button"
                onClick={() => setDishSort('units')}
                className={`min-h-8 rounded-lg px-2.5 font-medium transition-colors ${
                  dishSort === 'units' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Quantity
              </button>
              <button
                type="button"
                onClick={() => setDishSort('revenue')}
                className={`min-h-8 rounded-lg px-2.5 font-medium transition-colors ${
                  dishSort === 'revenue' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Revenue
              </button>
            </div>
          </div>
        </div>

        {dishSales.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No dishes sold in this period. Completed bills will populate here.
          </div>
        ) : filteredDishSales.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No dishes match "{dishSearch}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table role="table" aria-label="Dishes sold" className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[#202737] text-[10px] uppercase font-bold text-slate-400">
                  <th scope="col" className="py-2.5 px-3 w-12 text-center">No.</th>
                  <th scope="col" className="py-2.5 px-3">Dish / Item</th>
                  <th scope="col" className="py-2.5 px-3">Category</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Quantity Sold</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Revenue</th>
                  <th scope="col" className="py-2.5 px-3 text-right hidden sm:table-cell">% Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {filteredDishSales.map((item, index) => {
                  const share = totalUnitsSold > 0 ? Math.round((item.units / totalUnitsSold) * 100) : 0;
                  return (
                    <tr key={item.id + item.name} className="hover:bg-[#1a2130] transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{item.rawName}</span>
                          {item.variant && (
                            <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-normal">
                              {item.variant}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] bg-[#10141d] text-slate-300 px-2 py-0.5 rounded-full border border-[#232b3a]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white text-sm">
                        {item.units} <span className="text-[10px] text-slate-400 font-normal font-sans">units</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        ₹{item.revenue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-xs hidden sm:table-cell">
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#2b3548] font-bold text-xs bg-[#121620]">
                  <td colSpan={3} className="py-3 px-3 text-slate-300">
                    Total ({dishSales.length} {dishSales.length === 1 ? 'item' : 'items'})
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-white text-sm">
                    {totalUnitsSold} <span className="text-[10px] text-slate-400 font-normal font-sans">units</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                    ₹{dishSales.reduce((s, d) => s + d.revenue, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono text-xs hidden sm:table-cell">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Row: Category Breakdown & Staff Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Menu Category */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39] space-y-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Sales by Menu Category</h2>
          {categorySales.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No sales recorded yet. Completed orders will categorize here.
            </div>
          ) : (
            <div className="divide-y divide-[#202737]">
              {categorySales.map((c) => (
                <div key={c.category} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{c.category}</span>
                    <span className="text-[10px] text-slate-500 block">{c.units} units sold</span>
                  </div>
                  <div className="font-mono font-bold text-white">
                    ₹{c.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cashier & Staff Sales Performance */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39] space-y-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cashier & Staff Sales Performance</h2>
          {cashierSales.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No cashier transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#202737]">
              {cashierSales.map((cs) => (
                <div key={cs.name} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{cs.name}</span>
                    <span className="text-[10px] text-slate-500 block">{cs.bills} bills generated</span>
                  </div>
                  <div className="font-mono font-black text-emerald-400 text-sm">
                    ₹{cs.sales.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
