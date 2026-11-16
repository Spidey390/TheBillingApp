import React, { useState, useMemo } from 'react';
import { Printer, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { businessDate, dateRange as rangeFor, inRange } from '../../domain/dates';

export default function BusinessReports() {
  const { orders, expenses, products, showToast } = useApp();

  const [dateRange, setDateRange] = useState('Today'); // 'Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'

  const ranges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

  const today = businessDate();
  const [custom, setCustom] = useState({ start: today, end: today });
  const [start, end] = rangeFor(dateRange, today, custom);
  const rangeValid = start <= end;

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
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Period,${start} to ${end}\nMetric,Value\n`
      + `Gross Sales Revenue,₹${grossSales.toFixed(2)}\n`
      + `Refunds,₹${refundedTotal.toFixed(2)}\n`
      + `Operating Expenses,₹${totalExpenses.toFixed(2)}\n`
      + `Sales Less Recorded Expenses,₹${estimatedNetProfit.toFixed(2)}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${dateRange.toLowerCase().replace(/ /g, '-')}.csv`);
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

      {dateRange === 'Custom Range' && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 no-print">
          {['start', 'end'].map(key => (
            <label key={key} className="min-w-0 text-xs font-medium text-slate-300">
              {key === 'start' ? 'Start date' : 'End date'}
              <input type="date" value={custom[key]} onChange={event => setCustom({ ...custom, [key]: event.target.value })}
                className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-slate-600 bg-slate-900 px-2 text-base text-slate-100" />
            </label>
          ))}
        </div>
      )}
      {rangeValid ? <p className="text-sm text-slate-300">{start} to {end} · India time</p> :
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
