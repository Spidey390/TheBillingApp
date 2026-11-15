import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Trash2, X, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ExpenseManagement() {
  const { expenses, setExpenses, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [amount, setAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Rent', 'Electricity', 'Internet', 'Salary', 'Raw Material', 'Maintenance', 'Marketing', 'Delivery', 'Other'];

  const filteredExpenses = useMemo(() => {
    return activeCategory === 'All'
      ? expenses
      : expenses.filter(e => e.category === activeCategory);
  }, [expenses, activeCategory]);

  const totalOutflow = expenses.reduce((s, e) => s + e.amount, 0);

  const handleDelete = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
    showToast('Expense removed');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    const item = {
      id: 'exp-' + Date.now(),
      title: title.trim(),
      category,
      date: new Date().toISOString().slice(0, 10),
      amount: parseFloat(amount) || 0,
      paymentMethod: payMethod,
      reference: reference.trim() || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: notes.trim()
    };
    setExpenses([item, ...expenses]);
    setShowAddModal(false);
    setTitle('');
    setAmount('');
    setReference('');
    setNotes('');
    showToast(`Added expense ₹${item.amount.toFixed(2)}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Expense & Outflow Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily cafe overheads (rent, bills, staff payroll, cleaning) to calculate accurate Net Profit.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Categories & Total Outflow Badge */}
      <div className="bg-[#141923] p-3.5 rounded-2xl border border-[#232b3a] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-[#1a212e] text-slate-400 hover:text-white border border-[#283244]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Total Outflow Badge (Page 32) */}
        <div className="flex items-center space-x-2 bg-[#1b2230] px-3.5 py-1.5 rounded-xl border border-[#2c374b] shrink-0">
          <span className="text-xs text-slate-400 font-medium">Total Outflow:</span>
          <span className="text-sm font-black text-rose-400 font-mono">
            ₹{totalOutflow.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount (₹)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference / Receipt #</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2636]">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#18202d] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{exp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1a212e] text-slate-300 border border-[#2b3548]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4 font-mono font-black text-rose-400 text-sm">
                    ₹{exp.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 font-bold">{exp.paymentMethod}</td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{exp.reference}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{exp.notes}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      title="Delete Expense"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#1f2736] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Record Expense Outflow</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Expense Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Milk & Dairy Batch Purchase"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    required
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="BANK TRANSFER">BANK TRANSFER</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Reference / Receipt #</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. UPI-992812"
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Weekly stock purchase"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
