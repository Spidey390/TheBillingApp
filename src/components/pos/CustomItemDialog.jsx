import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Dialog from '../layout/Dialog';

const field = 'h-11 w-full rounded-lg border border-[#263143] bg-[#121620] px-3 text-base text-white';

export default function CustomItemDialog({ onAdd, onClose }) {
  const [saving, setSaving] = useState(false);
  const nameInput = useRef(null);

  useEffect(() => {
    nameInput.current?.focus();
  }, []);

  function close() {
    if (!saving) onClose();
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const fields = event.currentTarget.elements;
    const name = fields.dishName.value;
    const price = fields.dishPrice.valueAsNumber;
    setSaving(true);
    try {
      if (await onAdd(name, price)) onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog label="Custom item" onClose={close}>
      <form onSubmit={submit}
        className="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[#2b3547] bg-[#171c26] shadow-2xl">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-[#263143] px-4 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <h2 className="flex-1 font-bold text-white">Custom item</h2>
          <button type="button" aria-label="Close custom item" onClick={close} disabled={saving}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <fieldset disabled={saving} className="min-h-0 space-y-3.5 overflow-y-auto p-4 text-sm">
          <div>
            <label htmlFor="custom-item-name" className="mb-1.5 block font-semibold text-slate-300">Dish name</label>
            <input ref={nameInput} id="custom-item-name" name="dishName" type="text" required maxLength={100}
              autoComplete="off" className={field} />
          </div>
          <div>
            <label htmlFor="custom-item-price" className="mb-1.5 block font-semibold text-slate-300">Unit price (₹)</label>
            <input id="custom-item-price" name="dishPrice" type="number" inputMode="decimal" required min="0" step="0.01"
              className={`${field} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} />
          </div>
        </fieldset>

        <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-[#263143] px-4 py-3">
          <button type="button" onClick={close} disabled={saving}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-700/50 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="min-h-11 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-50">
            {saving ? 'Adding…' : 'Add to cart'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
