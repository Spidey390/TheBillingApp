import React from 'react';

export default function ToggleSwitch({ label, checked, onChange, descriptionId, disabled }) {
  return (
    <span className="relative shrink-0">
      <input type="checkbox" role="switch" aria-label={label} aria-describedby={descriptionId}
        checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="block h-6 w-11 rounded-full border border-slate-600 bg-slate-800
        after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-transform
        peer-checked:border-orange-500 peer-checked:bg-orange-700 peer-checked:after:translate-x-5 peer-checked:after:bg-white
        peer-disabled:opacity-60
        peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange-400" />
    </span>
  );
}
