import React, { useState } from 'react';
import { Plus, Wallet, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import { newId } from '../../domain/ids';
import { businessDate } from '../../domain/dates';
import { sanitizeText } from '../../domain/sanitize';

const expenseDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
});
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function ExpenseManagement() {
  const { expenses, saveExpense, deleteExpense, showToast, isOwner } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State: ONLY Reason and Amount
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const totalOutflow = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const handleDelete = (id) => {
    if (window.confirm('Remove this expense from the records?')) deleteExpense(id);
  };

  const closeEditor = () => {
    if (!isSaving) setShowAddModal(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const cleanReason = sanitizeText(reason, 200);
    const parsedAmount = parseFloat(amount);
    if (!cleanReason || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid reason and amount', 'warning');
      return;
    }

    const now = new Date();
    const dateStr = businessDate(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const item = {
      id: 'exp-' + newId(),
      reason: cleanReason,
      title: cleanReason, // for backwards compatibility
      date: dateStr,
      time: timeStr,
      createdAt: now.toISOString(),
      amount: parsedAmount,
      paymentMethod: 'Cash',
      notes: cleanReason
    };

    setIsSaving(true);
    try {
      if (!await saveExpense(item)) return;
      setShowAddModal(false);
      setReason('');
      setAmount('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-4 app-gutters py-4 sm:space-y-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-white">Cash expenses</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isOwner ? 'All operators' : 'Your expenses'}
          </p>
        </div>

        <button type="button" onClick={() => setShowAddModal(true)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-orange-700 px-3 text-sm font-semibold text-white hover:bg-orange-800 sm:px-4">
          <Plus className="size-4" aria-hidden="true" /> Add expense
        </button>
      </div>

      <section aria-label="Cash expense summary"
        className="flex items-center gap-2.5 rounded-2xl border border-[#232b3a] bg-[#141923] px-3 py-3 sm:gap-3 sm:p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-300">
          <Wallet className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-200">Total spent</h2>
          <p className="text-xs text-slate-400">{expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <span className="min-w-0 max-w-[55%] break-words text-right text-lg font-bold tabular-nums text-rose-300 sm:text-xl">
          {rupees.format(totalOutflow)}
        </span>
      </section>

      {/* Expenses Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center sm:py-12">
            <div className="grid size-10 place-items-center rounded-xl bg-[#1b2230] text-orange-300">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-white">No cash expenses yet</h2>
          </div>
        ) : (
          <div className="xl:overflow-x-auto">
            <table role="table" aria-label="Cash expenses" className="responsive-records mobile-table expense-records w-full text-left text-xs border-collapse min-w-[550px]">
              <thead role="rowgroup">
                <tr role="row" className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th role="columnheader" scope="col" aria-label="Serial number" className="record-serial px-3 py-3 text-center">No.</th>
                  <th role="columnheader" scope="col" className="py-3 px-4">
                    <span className="hidden md:inline">Reason / </span>Description
                  </th>
                  <th role="columnheader" scope="col" className="mobile-table-extra py-3 px-4">Date & Time</th>
                  <th role="columnheader" scope="col" className="expense-record-amount py-3 px-4">
                    Amount<span className="hidden md:inline"> (₹)</span>
                  </th>
                  <th role="columnheader" scope="col" className="mobile-table-extra py-3 px-4">Payment Mode</th>
                  <th role="columnheader" scope="col" className="expense-record-action-heading py-3 px-4 text-right">
                    <span className="sr-only md:not-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup" className="divide-y divide-[#1e2636]">
                {expenses.map((exp, index) => {
                  const label = exp.reason || exp.title;
                  const storedDate = exp.date || (exp.createdAt && businessDate(exp.createdAt));
                  const date = new Date(`${storedDate}T00:00:00Z`);
                  const formattedDate = Number.isNaN(date.valueOf()) ? storedDate : expenseDate.format(date);
                  const createdAt = new Date(exp.createdAt);
                  const time = exp.time || (!Number.isNaN(createdAt.valueOf()) && exp.createdAt
                    ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '');
                  return (
                    <tr role="row" key={exp.id} className="hover:bg-[#18202d] transition-colors">
                      <td role="cell" className="record-serial px-3 py-3 text-center tabular-nums text-slate-400">{index + 1}</td>
                      <td role="cell" className="py-3 px-4 font-bold text-white record-title">
                        <span>{label}</span>
                        {isOwner && exp.recordedByName && <div className="mt-0.5 text-xs font-normal text-slate-400">{exp.recordedByName}</div>}
                        <div className="mt-0.5 text-xs font-normal text-slate-400 md:hidden">
                          {formattedDate}{' '}
                          {time && <span className="inline-block whitespace-nowrap">{formattedDate && '· '}{time}</span>}
                        </div>
                      </td>
                      <td role="cell" className="expense-record-date mobile-table-extra py-3 px-4 text-slate-400">
                        <span>{formattedDate || '—'}</span>
                        {time && <span className="xl:block xl:text-[10px]">
                          <span aria-hidden="true" className="mx-1.5 xl:hidden">·</span>{time}
                        </span>}
                      </td>
                      <td role="cell" className="expense-record-amount py-3 px-4 text-sm font-bold tabular-nums text-rose-300">
                        {rupees.format(Number(exp.amount) || 0)}
                      </td>
                      <td role="cell" className="expense-record-payment mobile-table-extra py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Cash
                        </span>
                      </td>
                      <td role="cell" className="py-3 px-4 text-right record-actions">
                        <button type="button" aria-label={`Delete expense: ${label}`}
                          onClick={() => handleDelete(exp.id)}
                          title="Delete Expense"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#1f2736] transition-colors"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal - ONLY Reason & Amount, strictly Cash */}
      {showAddModal && (
        <Dialog label="Record expense" onClose={closeEditor}>
          <form onSubmit={handleAddSubmit}
            className="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#2b3547] bg-[#181e28] shadow-2xl">
            <header className="flex shrink-0 items-center gap-2.5 border-b border-[#232b3a] px-4 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
                <Wallet className="size-5" aria-hidden="true" />
              </div>
              <h2 className="flex-1 font-bold text-white">Record cash expense</h2>
              <button type="button" aria-label="Close" onClick={closeEditor} disabled={isSaving}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50">
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            <fieldset disabled={isSaving} className="min-h-0 min-w-0 space-y-4 overflow-y-auto p-4 text-sm">
              <div>
                <label htmlFor="expense-reason" className="mb-1.5 block font-semibold text-slate-300">Description</label>
                <input id="expense-reason"
                  type="text"
                  maxLength={200}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter expense description"
                  required
                  className="h-11 w-full rounded-lg border border-[#263143] bg-[#121620] px-3 text-base text-white"
                />
              </div>

              <div>
                <label htmlFor="expense-amount" className="mb-1.5 block font-semibold text-slate-300">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">₹</span>
                  <input id="expense-amount" type="number" inputMode="decimal"
                    step="any"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="h-11 w-full rounded-lg border border-[#263143] bg-[#121620] pl-7 pr-3 text-base tabular-nums text-white
                      [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>

            </fieldset>
            <footer className="flex shrink-0 justify-end gap-2 border-t border-[#232b3a] px-4 py-3">
              <button type="button" onClick={closeEditor} disabled={isSaving}
                className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-700/50 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="min-h-11 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-50">
                {isSaving ? 'Saving…' : 'Save expense'}
              </button>
            </footer>
          </form>
        </Dialog>
      )}
    </div>
  );
}
