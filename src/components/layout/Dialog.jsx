import React, { useLayoutEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function Dialog({ label, onClose, children, className = 'items-center justify-center p-3 sm:p-4' }) {
  const ref = useRef(null);
  const { toast } = useApp();

  useLayoutEffect(() => {
    const element = ref.current;
    const trigger = document.activeElement;
    element.showModal();
    if (!element.contains(document.activeElement)) element.focus();
    return () => {
      element.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  return (
    <dialog ref={ref} aria-label={label} className={`app-dialog !m-0 flex ${className}`}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onCancel={event => { event.preventDefault(); onClose(); }}>
      {children}
      {toast?.type === 'error' && (
        <div role="alert" className="pointer-events-none absolute top-2 inset-x-3 mx-auto w-fit max-w-full rounded-lg border border-rose-700 bg-[#25151e] px-3 py-2 text-sm text-rose-200">
          {toast.message}
        </div>
      )}
    </dialog>
  );
}
