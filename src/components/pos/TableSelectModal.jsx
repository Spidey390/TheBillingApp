import React, { useState } from 'react';
import { X, Users, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TableSelectModal() {
  const { tables, selectedTable, setSelectedTable, closeModal, showToast, triggerAudio, activeShopId } = useApp();
  const [selectedFloor, setSelectedFloor] = useState('All');

  const floors = ['All', 'Main Floor', 'Balcony Garden', 'Mezzanine'];

  const shopTables = activeShopId === 'all'
    ? tables
    : tables.filter(t => t.shopId === activeShopId || !t.shopId);

  const filteredTables = selectedFloor === 'All'
    ? shopTables
    : shopTables.filter(t => t.floor === selectedFloor);

  const handleSelect = (table) => {
    triggerAudio('beep');
    setSelectedTable(table);
    closeModal();
    showToast(`Assigned ${table.id} (${table.name}) to active bill`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Select Dine-In Table</h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose a table to link with this cafe order</p>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floor Filter Tabs */}
        <div className="px-4 py-2.5 bg-[#121620] border-b border-[#212837] flex items-center space-x-2">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedFloor === floor
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-[#181e2a] text-slate-400 hover:text-slate-200 border border-[#252f40]'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredTables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              const isAvailable = table.status === 'Available';
              const isOccupied = table.status === 'Occupied';
              return (
                <div
                  key={table.id}
                  onClick={() => handleSelect(table)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/40'
                      : 'border-[#263143] bg-[#141923] hover:bg-[#1a212e] hover:border-[#37455e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-extrabold text-white font-mono">{table.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isOccupied
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {table.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-300 truncate">{table.name}</div>

                  <div className="mt-2.5 pt-2 border-t border-[#1f2736] flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{table.seats} seats</span>
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{table.floor}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141924] border-t border-[#232b3a] flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1a212e] text-slate-300 hover:text-white border border-[#2a3548] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
