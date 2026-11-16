import React from 'react';
import { X } from 'lucide-react';
import Dialog from './Dialog';

export default function FilterDialog({ title = 'Filters', groups, onApply, onClose: close }) {
  function apply(event) {
    event.preventDefault();
    onApply(Object.fromEntries(new FormData(event.currentTarget)));
    close();
  }

  return (
    <Dialog label={title} onClose={close}>
      <form onSubmit={apply}
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#171c26] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700/60 px-4 py-2">
          <h2 className="font-bold text-white">{title}</h2>
          <button type="button" aria-label={`Close ${title.toLowerCase()}`} onClick={close}
            className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-slate-700/50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 space-y-4 overflow-y-auto p-4">
          {groups.map(({ name, label, value, options }) => (
            <fieldset key={name} className="min-w-0">
              <legend className="mb-1.5 text-xs font-semibold text-slate-300">{label}</legend>
              <div className="space-y-1">
                {options.map(option => (
                  <label key={option.value}
                    className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-1.5 text-sm text-slate-200 hover:bg-slate-800 has-[:checked]:border-orange-500/30 has-[:checked]:bg-orange-500/10">
                    <input type="radio" name={name} value={option.value} defaultChecked={option.value === value}
                      className="size-4 shrink-0 accent-orange-500" />
                    <span className="min-w-0 flex-1 break-words">{option.label ?? option.value}</span>
                    {option.count !== undefined && <span className="text-xs tabular-nums text-slate-400">{option.count}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-700/60 px-4 py-3">
          <button type="button" onClick={close}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-700/50">Cancel</button>
          <button type="submit"
            className="min-h-11 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800">Apply filters</button>
        </div>
      </form>
    </Dialog>
  );
}
