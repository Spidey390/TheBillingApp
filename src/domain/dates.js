const shopFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
});

export function businessDate(value = new Date()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : shopFormat.format(date);
}

export function shiftDate(date, days) {
  const instant = new Date(date + 'T00:00:00Z');
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}

export function dateRange(preset, date = businessDate(), custom = {}) {
  switch (preset) {
    case 'Today': return [date, date];
    case 'Yesterday': {
      const day = shiftDate(date, -1);
      return [day, day];
    }
    case 'This Week': {
      const weekday = new Date(date + 'T00:00:00Z').getUTCDay();
      const start = shiftDate(date, -((weekday + 6) % 7));
      return [start, shiftDate(start, 6)];
    }
    case 'This Month': return [date.slice(0, 7) + '-01', date.slice(0, 7) + '-31'];
    case 'Last 7 Days': return [shiftDate(date, -6), date];
    case 'Last 30 Days': return [shiftDate(date, -29), date];
    case 'Specific Day': {
      const target = custom.date || custom.start || date;
      return [target, target];
    }
    case 'Custom Range': return [custom.start || date, custom.end || date];
    case 'All':
    default: return ['0000-01-01', '9999-12-31'];
  }
}

export const inRange = (date, [start, end]) => !!date && date >= start && date <= end;
