import React from 'react';
import { X, Users, Grid2X2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import { calculateBill } from '../../domain/billing';
import { isTableOccupied } from '../../domain/tables';

export default function TableSelectModal() {
  const { tables, selectedTable, setSelectedTable, closeModal, showToast, triggerAudio } = useApp();

  const handleSelect = async (table) => {
    triggerAudio('beep');
    if (!await setSelectedTable(table)) return;
    closeModal();
    const itemCount = table.activeOrder?.items?.length || 0;
    if (itemCount > 0) {
      showToast(`Loaded ${table.name} (${itemCount} active items) into POS`);
    } else {
      showToast(`Selected ${table.name} for new order`);
    }
  };

  return (
    <Dialog label="Select dine-in table" onClose={closeModal}>
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Select Dine-In Table</h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose a table to link with this cafe order</p>
          </div>
          <button
            type="button" aria-label="Close" onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tables Grid or Empty State */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[180px]">
          {tables.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Grid2X2 className="w-10 h-10 mb-2 text-slate-600 stroke-1" />
              <p className="text-sm font-bold text-slate-300">No tables yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Ask the owner to add a table.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const activeItems = table.activeOrder?.items || [];
                const itemCount = activeItems.reduce((s, i) => s + i.quantity, 0);
                const isOccupied = isTableOccupied(table);
                const runningTotal = calculateBill(activeItems, table.activeOrder?.discountPercent || 0).total;

                return (
                  <button type="button" aria-pressed={isSelected}
                    key={table.id}
                    onClick={() => handleSelect(table)}
                    className={`p-3 text-left min-w-0 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/40'
                        : isOccupied
                        ? 'border-orange-500/40 bg-[#161c27] hover:border-orange-500'
                        : 'border-[#263143] bg-[#141923] hover:bg-[#1a212e] hover:border-[#37455e]'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <span className="min-w-0 truncate text-sm font-extrabold text-white" title={table.name}>{table.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isOccupied
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isOccupied ? `Occupied (${itemCount})` : 'Available'}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="mt-2 pt-1.5 border-t border-[#1f2736] flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="text-slate-400">{itemCount} items</span>
                        <span className="font-mono font-bold text-emerald-400">₹{runningTotal.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="mt-2 pt-1.5 border-t border-[#1f2736] flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{table.seats} {table.seats === 1 ? 'seat' : 'seats'}</span>
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141924] border-t border-[#232b3a] flex justify-end shrink-0">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1a212e] text-slate-300 hover:text-white border border-[#2a3548] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}
