import React, { useState, useMemo } from 'react';
import { Printer, Download, IndianRupee, Percent, Wallet, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BusinessReportsGST() {
  const { orders, expenses, products, showToast } = useApp();

  const [dateRange, setDateRange] = useState('Today'); // 'Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'

  const ranges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

  // Calculate matching stats strictly from real data
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const grossSales = completedOrders.reduce((s, o) => s + o.total, 0);
  const totalTax = completedOrders.reduce((s, o) => s + (o.cgst + o.sgst), 0);
  const cgstTotal = totalTax / 2;
  const sgstTotal = totalTax / 2;
  const taxableValue = Math.max(0, grossSales - totalTax);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const estimatedNetProfit = grossSales - totalExpenses;

  // Category breakdown aggregated dynamically from actual orders
  const categorySales = useMemo(() => {
    const cats = {};
    completedOrders.forEach(o => {
      o.items?.forEach(it => {
        const prod = products.find(p => p.id === it.id || p.name === it.name);
        const catName = prod ? prod.category : 'General';
        if (!cats[catName]) cats[catName] = { category: catName, units: 0, revenue: 0 };
        cats[catName].units += it.quantity;
        cats[catName].revenue += it.total || (it.price * it.quantity);
      });
    });
    return Object.values(cats).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders, products]);

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
      + "Metric,Value\n"
      + `Gross Sales Revenue,₹${grossSales.toFixed(2)}\n`
      + `Total GST Collected,₹${totalTax.toFixed(2)}\n`
      + `CGST (2.5%),₹${cgstTotal.toFixed(2)}\n`
      + `SGST (2.5%),₹${sgstTotal.toFixed(2)}\n`
      + `Operating Expenses,₹${totalExpenses.toFixed(2)}\n`
      + `Estimated Net Profit,₹${estimatedNetProfit.toFixed(2)}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gst-report-${dateRange.toLowerCase().replace(/ /g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Business Reports & GST Filing</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyze sales performance, gross & net margins, GST breakdown, and cashier efficiency.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1b2230] hover:bg-[#252f42] text-slate-200 border border-[#2b3548] text-xs font-bold transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-[#141923] p-2 rounded-2xl border border-[#232b3a] inline-flex items-center space-x-1">
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateRange === r
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39]">
          <span className="text-xs text-slate-400 font-medium">Gross Sales Revenue</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{grossSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedOrders.length} Completed Orders
          </div>
        </div>

        {/* Total GST */}
        <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39]">
          <span className="text-xs text-slate-400 font-medium">Total GST Tax Collected</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">
            ₹{totalTax.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            CGST ₹{cgstTotal.toFixed(2)} | SGST ₹{sgstTotal.toFixed(2)}
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
          <span className="text-xs text-slate-400 font-medium">Estimated Net Profit</span>
          <div className={`text-2xl font-black font-mono mt-1 ${estimatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{estimatedNetProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Revenue - Expenses
          </div>
        </div>
      </div>

      {/* GST Summary & Filing Data Table */}
      <div className="bg-[#171c26] p-5 rounded-2xl border border-[#232a39] space-y-3">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">GST Summary & Filing Data</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Taxable turnover and CGST/SGST tax liability</p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th className="py-2.5 px-4">Tax Description</th>
                <th className="py-2.5 px-4">Rate</th>
                <th className="py-2.5 px-4">Taxable Value (₹)</th>
                <th className="py-2.5 px-4">CGST Amount (₹)</th>
                <th className="py-2.5 px-4">SGST Amount (₹)</th>
                <th className="py-2.5 px-4 text-right">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[#1a212e] transition-colors font-mono">
                <td className="py-3 px-4 font-bold text-white font-sans">Standard Cafe F&B Rate</td>
                <td className="py-3 px-4 text-slate-300">5.0%</td>
                <td className="py-3 px-4 text-white">₹{taxableValue.toFixed(2)}</td>
                <td className="py-3 px-4 text-sky-400">₹{cgstTotal.toFixed(2)}</td>
                <td className="py-3 px-4 text-sky-400">₹{sgstTotal.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-black text-white">₹{totalTax.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
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
