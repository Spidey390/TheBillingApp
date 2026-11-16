import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';

export default function RefundDialog({ order, onClose }) {
  const { refundOrder } = useApp();
  const [busy, setBusy] = useState(false);

  async function handleRefund(event) {
    event.preventDefault();
    if (busy) return;
    const details = new FormData(event.currentTarget);
    const reason = details.get('reason').trim();
    if (!reason || !details.get('confirmed')) return;
    setBusy(true);
    try {
      if (await refundOrder(order, reason)) onClose();
    } finally {
      setBusy(false);
    }
  }

  const close = () => { if (!busy) onClose(); };

  return (
    <Dialog label="Record full refund" onClose={close}>
      <form onSubmit={handleRefund} className="max-h-full w-full max-w-md space-y-4 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm">
        <h2 className="font-bold">Record a full refund for {order.invoiceNo}</h2>
        <p>Return ₹{order.total.toFixed(2)} through the original payment method before recording the refund here.</p>
        <label className="block">Reason
          <textarea name="reason" required maxLength={300} className="mt-1 block w-full rounded border border-slate-600 bg-slate-950 p-2" />
        </label>
        <label className="flex items-start gap-2"><input type="checkbox" name="confirmed" required />
          I returned the full amount to the customer.
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" disabled={busy} onClick={close} className="min-h-11 rounded border border-slate-600 px-3">Cancel</button>
          <button type="submit" disabled={busy} className="min-h-11 rounded bg-rose-800 px-3">Save refund record</button>
        </div>
      </form>
    </Dialog>
  );
}
