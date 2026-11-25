import React, { useEffect, useRef, useState } from 'react';
import { Tag, X } from 'lucide-react';
import Dialog from '../layout/Dialog';

export default function DiscountDialog({ percent, hasDiscount, onApply, onClose }) {
  const [saving, setSaving] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  function close() {
    if (!saving) onClose();
  }

  async function save(value) {
    if (saving) return;
    setSaving(true);
    try {
      if (await onApply(value)) onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog label="Bill discount" onClose={close}>
      <form onSubmit={event => { event.preventDefault(); save(input.current.valueAsNumber); }}
        className="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#2b3547] bg-[#171c26] shadow-2xl">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-[#263143] px-4 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
            <Tag className="size-5" aria-hidden="true" />
          </span>
          <h2 className="flex-1 font-bold text-white">Bill discount</h2>
          <button type="button" aria-label="Close discount" disabled={saving} onClick={close}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <fieldset disabled={saving} className="min-h-0 overflow-y-auto p-4 text-sm">
          <div>
            <label htmlFor="bill-discount-value" className="mb-1.5 block font-semibold text-slate-300">Discount percentage</label>
            <div className="relative">
              <input ref={input} id="bill-discount-value" type="number" inputMode="decimal" required min="0" max="100" step="0.01"
                aria-describedby="bill-discount-limit" defaultValue={percent || ''}
                className="h-11 w-full rounded-lg border border-[#263143] bg-[#121620] pl-3 pr-9 text-base tabular-nums text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                %
              </span>
            </div>
            <p id="bill-discount-limit" className="mt-1.5 text-xs text-slate-400">Up to 100%</p>
          </div>
        </fieldset>

        <footer className="flex shrink-0 flex-wrap justify-between gap-2 border-t border-[#263143] px-3 py-3 sm:px-4">
          {hasDiscount && (
            <button type="button" onClick={() => save(0)} disabled={saving}
              className="min-h-11 rounded-lg px-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">
              Remove discount
            </button>
          )}
          <button type="submit" disabled={saving}
            className="ml-auto min-h-11 rounded-lg bg-orange-700 px-3 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-50 sm:px-4">
            {saving ? 'Saving…' : 'Apply discount'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
