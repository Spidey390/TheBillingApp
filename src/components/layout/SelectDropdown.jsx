import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Custom dark-mode accessible select dropdown.
 * Replaces native OS dropdown with styled, accessible floating menu.
 */
export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select option…',
  ariaLabel,
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || null;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#263143] bg-[#121620] px-3 py-2 text-left text-sm text-white transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen ? 'border-orange-500 ring-1 ring-orange-500' : 'hover:border-slate-600'
        }`}
      >
        <span className="truncate font-medium text-slate-100">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-orange-400' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Dark Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-[#2b374c] bg-[#161c28] py-1.5 shadow-2xl shadow-black/80 animate-in fade-in-0 zoom-in-95 duration-100 focus:outline-none"
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-xs transition-colors focus:outline-none ${
                  isSelected
                    ? 'bg-orange-500/15 font-bold text-orange-400'
                    : 'text-slate-200 hover:bg-[#1f2737] hover:text-white'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {opt.icon && <opt.icon className="size-4 shrink-0" aria-hidden="true" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="size-4 shrink-0 text-orange-400" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
