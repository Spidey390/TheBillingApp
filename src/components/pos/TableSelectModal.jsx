import React, { useState, useMemo } from 'react';
import { X, Users, Grid2X2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TableSelectModal() {
  const { tables, selectedTable, setSelectedTable, closeModal, showToast, triggerAudio } = useApp();
  const [selectedFloor, setSelectedFloor] = useState('All');

  // Dynamically derive floors from manually added tables only (Zero default floors)
  const uniqueFloors = useMemo(() => {
    const set = new Set();
    tables.forEach(t => {
      if (t.floor && t.floor.trim()) set.add(t.floor.trim());
    });
    return Array.from(set);
  }, [tables]);

  const floors = uniqueFloors.length > 0 ? ['All', ...uniqueFloors] : [];

  const filteredTables = selectedFloor === 'All'
    ? tables
    : tables.filter(t => t.floor === selectedFloor);

  const handleSelect = (table) => {
    triggerAudio('beep');
    setSelectedTable(table);
    closeModal();
    showToast(`Assigned ${table.id} (${table.name}) to active bill`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between shrink-0">
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

        {/* Floor Filter Tabs (Only shown when floors exist) */}
        {floors.length > 0 && (
          <div className="px-4 py-2.5 bg-[#121620] border-b border-[#212837] flex items-center space-x-2 overflow-x-auto shrink-0">
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedFloor === floor
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-[#181e2a] text-slate-400 hover:text-slate-200 border border-[#252f40]'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        )}

        {/* Tables Grid or Empty State */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[180px]">
          {tables.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Grid2X2 className="w-10 h-10 mb-2 text-slate-600 stroke-1" />
              <p className="text-sm font-bold text-slate-300">No Dining Tables Added</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Tables can only be added manually. Visit the "Tables Floor" tab to create your tables and floor sections.
              </p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center p-6 text-xs text-slate-400">
              No tables in floor "{selectedFloor}".
            </div>
          ) : (
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
                      <span className="text-[10px] text-orange-400/80 font-medium truncate max-w-[80px]">{table.floor}</span>
                    </div>
                  </div>
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
    </div>
  );
}
