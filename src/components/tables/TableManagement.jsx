import React, { useState } from 'react';
import { Plus, Users, Zap, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TableManagement() {
  const { tables, setTables, setSelectedTable, setActiveView, showToast, triggerAudio } = useApp();

  const [selectedFloor, setSelectedFloor] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newFloor, setNewFloor] = useState('Main Floor');
  const [newSeats, setNewSeats] = useState(4);

  const floors = ['All', 'Main Floor', 'Balcony Garden', 'Mezzanine'];

  const filteredTables = selectedFloor === 'All'
    ? tables
    : tables.filter(t => t.floor === selectedFloor);

  // Counts
  const availableCount = tables.filter(t => t.status === 'Available').length;
  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;
  const reservedCount = tables.filter(t => t.status === 'Reserved').length;

  const handleLaunchPOS = (table) => {
    triggerAudio('beep');
    setSelectedTable(table);
    setActiveView('pos');
    showToast(`Loaded ${table.id} into POS Terminal`);
  };

  const handleStatusChange = (tableId, newStatus) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    showToast(`Table ${tableId} set to ${newStatus}`);
  };

  const handleDeleteTable = (tableId) => {
    setTables(tables.filter(t => t.id !== tableId));
    showToast(`Table ${tableId} removed`);
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newId || !newName) return;
    const tableObj = {
      id: newId.toUpperCase(),
      name: newName,
      floor: newFloor,
      seats: Number(newSeats) || 2,
      status: 'Available'
    };
    setTables([...tables, tableObj]);
    setShowAddModal(false);
    setNewId('');
    setNewName('');
    showToast(`Created table ${tableObj.id}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Table & Floor Plan Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual table status, running bills, and floor seating layout.
          </p>
        </div>
        <button
          onClick={() => {
            setNewId(`T-${String(tables.length + 1).padStart(2, '0')}`);
            setNewName(`Table ${tables.length + 1}`);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-[#141923] p-3.5 rounded-2xl border border-[#232b3a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Floor Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#10131a] p-1 rounded-xl border border-[#212837] overflow-x-auto">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFloor === floor
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Status Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available ({availableCount})</span>
          </div>
          <div className="flex items-center space-x-1.5 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Occupied ({occupiedCount})</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Reserved ({reservedCount})</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isAvailable = table.status === 'Available';
          const isOccupied = table.status === 'Occupied';
          const isReserved = table.status === 'Reserved';

          return (
            <div
              key={table.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isAvailable
                  ? 'border-[#232b3b] bg-[#141923] hover:border-[#344158]'
                  : isOccupied
                  ? 'border-orange-500/40 bg-orange-950/10'
                  : 'border-blue-500/40 bg-blue-950/10'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-black text-white font-mono">{table.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isOccupied
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {table.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200">{table.name}</h3>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{table.seats} seats</span>
                  </span>
                  <span>•</span>
                  <span>{table.floor}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-[#1f2737]">
                <button
                  onClick={() => handleLaunchPOS(table)}
                  className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>POS Bill</span>
                </button>

                {/* Status Switcher Select */}
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  className="bg-[#1b2230] text-[11px] text-slate-300 px-2 py-1.5 rounded-lg border border-[#2b3548] focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>

                <button
                  onClick={() => handleDeleteTable(table.id)}
                  title="Delete Table"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#1f2736] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Add New Dining Table</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Table ID / Code</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. T-11"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Table Display Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Table 11 (Terrace)"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Floor Section</label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143] focus:outline-none"
                  >
                    <option value="Main Floor">Main Floor</option>
                    <option value="Balcony Garden">Balcony Garden</option>
                    <option value="Mezzanine">Mezzanine</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newSeats}
                    onChange={(e) => setNewSeats(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
