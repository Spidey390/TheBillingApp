import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import FilterDialog from './FilterDialog';

export default function FilterToolbar({ search, onSearch, searchLabel, placeholder, groups, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = groups.filter(group => group.value !== group.defaultValue).length;
  const close = () => setIsOpen(false);

  return (
    <div className="rounded-2xl border border-[#232b3a] bg-[#141923] p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" aria-label={searchLabel} placeholder={placeholder} value={search}
            onChange={event => onSearch(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#293345] bg-[#1b2230] pl-9 pr-3 text-sm text-white placeholder:text-slate-400" />
        </div>
        <button type="button" aria-haspopup="dialog" onClick={() => setIsOpen(true)}
          className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-sm font-semibold sm:px-3 ${
            activeCount
              ? 'border-orange-500/50 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'
              : 'border-[#293345] bg-[#1b2230] text-slate-200 hover:bg-slate-700'
          }`}>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filter
          {activeCount > 0 && (
            <span className="rounded-md bg-orange-500/20 px-1.5 text-xs tabular-nums">
              <span className="sr-only">, active filters:</span> {activeCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <FilterDialog groups={groups} onApply={onApply} onClose={close} />
      )}
    </div>
  );
}
