import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { shiftDate, businessDate } from '../../domain/dates';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DayCalendarPicker({ value, onChange, label = 'Select Date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const nativeInputRef = useRef(null);

  const todayStr = businessDate();
  const selectedDateStr = value || todayStr;

  // Split selected value into year, month (0-11), day
  const [valYear, valMonth, valDay] = selectedDateStr.split('-').map(Number);
  
  // Viewing month in the calendar popup
  const [viewYear, setViewYear] = useState(valYear || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState((valMonth ? valMonth - 1 : new Date().getMonth()));

  // Sync view when value changes from outside
  useEffect(() => {
    if (valYear && valMonth) {
      setViewYear(valYear);
      setViewMonth(valMonth - 1);
    }
  }, [selectedDateStr, valYear, valMonth]);

  // Close calendar popup on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate days for the grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarDays.push({
      day: d,
      dateStr: `${viewYear}-${mm}-${dd}`
    });
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelect = (dateStr) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  // Human-readable format: "Wed, 25 Nov 2026"
  const formattedDisplay = (() => {
    try {
      const parts = selectedDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch {}
    return selectedDateStr;
  })();

  const isToday = selectedDateStr === todayStr;

  return (
    <div className="relative inline-flex flex-wrap items-center gap-2 no-print" ref={containerRef}>
      {/* Day stepper and calendar popup toggle */}
      <div className="flex items-center rounded-xl border border-[#2b3548] bg-[#141923] p-1">
        <button
          type="button"
          onClick={() => onChange(shiftDate(selectedDateStr, -1))}
          title="Previous Day"
          aria-label="Previous day"
          className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1f2737] hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          className={`flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition-colors ${
            isOpen ? 'bg-orange-500 text-white' : 'text-slate-200 hover:bg-[#1f2737]'
          }`}
          aria-expanded={isOpen}
          aria-label="Open calendar picker"
        >
          <Calendar className="w-4 h-4 text-orange-400" />
          <span>{formattedDisplay}</span>
          {isToday && (
            <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-orange-300 border border-orange-500/30">
              Today
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange(shiftDate(selectedDateStr, 1))}
          title="Next Day"
          aria-label="Next day"
          className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1f2737] hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Today Jump */}
      {!isToday && (
        <button
          type="button"
          onClick={() => onChange(todayStr)}
          className="min-h-11 rounded-xl border border-[#2b3548] bg-[#171d2a] px-3 text-xs font-semibold text-orange-400 hover:bg-[#20283a] hover:text-orange-300 transition-colors"
        >
          Jump to Today
        </button>
      )}

      {/* Native Picker Button as second quick option */}
      <div className="relative inline-block">
        <input
          ref={nativeInputRef}
          type="date"
          value={selectedDateStr}
          onChange={e => e.target.value && onChange(e.target.value)}
          onClick={(e) => {
            try { e.target.showPicker?.(); } catch {}
          }}
          style={{ colorScheme: 'dark' }}
          className="min-h-11 cursor-pointer rounded-xl border border-[#2b3548] bg-[#141923] px-3 text-xs font-semibold text-slate-200 focus:border-orange-500 focus:outline-none"
          title="Click to open browser calendar"
        />
      </div>

      {/* Dropdown Calendar Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[#2b3548] bg-[#161c28] p-4 shadow-2xl backdrop-blur-md">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#242e40]">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-[#202737] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center font-bold text-xs text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-[#202737] hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 pt-2 text-center text-[11px] font-semibold text-slate-400">
            {WEEKDAYS.map(w => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="size-8" />;
              }
              const isSelected = cell.dateStr === selectedDateStr;
              const isTodayCell = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelect(cell.dateStr)}
                  className={`grid size-8 place-items-center rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 font-bold scale-105'
                      : isTodayCell
                      ? 'border border-orange-400/60 text-orange-300 hover:bg-[#222b3d]'
                      : 'text-slate-300 hover:bg-[#222b3d] hover:text-white'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick presets footer inside calendar */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#242e40] text-xs">
            <button
              type="button"
              onClick={() => handleSelect(todayStr)}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelect(shiftDate(todayStr, -1))}
              className="text-slate-400 hover:text-white font-medium"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
