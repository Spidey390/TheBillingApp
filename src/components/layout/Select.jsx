import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Trash2 } from 'lucide-react';

export default function Select({
  label,
  value,
  onChange,
  onDeleteOption,
  options = [],
  className = '',
  buttonClassName = '',
  disabled = false,
  placeholder = 'Select an option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value);
  const displayLabel = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label ?? selectedOption.value : selectedOption)
    : (value || placeholder);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#263143] bg-[#121620] px-3 py-2 text-left text-sm text-white transition-colors hover:border-slate-500 focus:border-orange-500 focus:outline-none disabled:opacity-50 ${buttonClassName}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-orange-400' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-slate-700 bg-[#181e2b] p-1 shadow-2xl space-y-0.5"
        >
          {options.map((option) => {
            const optVal = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label ?? option.value : option;
            const canDelete = typeof option === 'object' ? (option.canDelete ?? true) : true;
            const isSelected = optVal === value;

            return (
              <div
                key={optVal}
                className={`group/opt flex w-full items-center justify-between gap-1 rounded-lg px-2 py-0.5 transition-colors ${
                  isSelected
                    ? 'bg-orange-500/15 font-semibold text-orange-300'
                    : 'text-slate-200 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className="flex flex-1 items-center justify-between gap-2 text-left text-xs sm:text-sm min-w-0 py-1.5"
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-orange-400" aria-hidden="true" />}
                </button>
                {onDeleteOption && canDelete && optVal !== '__new__' && (
                  <button
                    type="button"
                    title={'Delete ' + optLabel}
                    aria-label={'Delete ' + optLabel}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOption(optVal, e);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 opacity-70 group-hover/opt:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
