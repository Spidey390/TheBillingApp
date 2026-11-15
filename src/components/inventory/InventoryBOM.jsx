import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Search, AlertTriangle, CheckCircle2, History, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InventoryBOM() {
  const { 
    rawMaterials, 
    setRawMaterials, 
    products, 
    setProducts, 
    auditLogs, 
    adjustRawStock,
    showToast,
    settings 
  } = useApp();

  const [activeTab, setActiveTab] = useState('raw'); // 'raw', 'products', 'audit'
  const [search, setSearch] = useState('');

  // Adjust stock modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedRawId, setSelectedRawId] = useState(rawMaterials[0]?.id || '');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical count audit');

  // Add raw material modal state
  const [showAddRawModal, setShowAddRawModal] = useState(false);
  const [newRawName, setNewRawName] = useState('');
  const [newRawCode, setNewRawCode] = useState(`RAW-${String(rawMaterials.length + 1).padStart(3, '0')}`);
  const [newRawCat, setNewRawCat] = useState('Coffee & Tea');
  const [newRawUnit, setNewRawUnit] = useState('KG');
  const [newRawStock, setNewRawStock] = useState('10');
  const [newRawMin, setNewRawMin] = useState('2');
  const [newRawCost, setNewRawCost] = useState('250');

  // Filtered raw materials
  const filteredRaw = useMemo(() => {
    return rawMaterials.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [rawMaterials, search]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l =>
      l.notes.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
    );
  }, [auditLogs, search]);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty === 0) return;
    adjustRawStock(selectedRawId, qty, adjustReason);
    setShowAdjustModal(false);
    setAdjustQty('');
  };

  const handleAddRawSubmit = (e) => {
    e.preventDefault();
    if (!newRawName.trim()) return;
    const item = {
      id: newRawCode,
      name: newRawName.trim(),
      code: newRawCode,
      category: newRawCat,
      currentStock: Number(newRawStock) || 0,
      minThreshold: Number(newRawMin) || 1,
      unit: newRawUnit,
      unitCost: Number(newRawCost) || 50,
      status: (Number(newRawStock) || 0) <= (Number(newRawMin) || 1) ? 'Low Stock' : 'Sufficient'
    };
    setRawMaterials([...rawMaterials, item]);
    setShowAddRawModal(false);
    setNewRawName('');
    showToast(`Added raw ingredient ${item.name}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Inventory & Recipe BOM Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock alerts, ingredient batch levels, and automatic sales consumption audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1b2230] hover:bg-[#252f42] text-slate-200 border border-[#2b3548] text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => setShowAddRawModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Raw Material</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-[#141923] p-4 rounded-2xl border border-[#232b3a] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Sub-tabs */}
        <div className="flex items-center space-x-1 bg-[#10131a] p-1 rounded-xl border border-[#212837] shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'raw'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Materials & Ingredients
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Menu Product Stocks
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Audit Log
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-[#293345] focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Tab 1: Raw Materials Table (Page 27) */}
      {activeTab === 'raw' && (
        <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Material Name</th>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min. Threshold</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {filteredRaw.map((r) => {
                  const isSufficient = r.currentStock > r.minThreshold;
                  return (
                    <tr key={r.id} className="hover:bg-[#18202d] transition-colors group">
                      <td className="py-3 px-4 font-bold text-white">{r.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{r.code}</td>
                      <td className="py-3 px-4 text-slate-300">{r.category}</td>
                      <td className="py-3 px-4 font-bold font-mono text-white">
                        {r.currentStock} {r.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {r.minThreshold} {r.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        ₹{r.unitCost} / {r.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-max ${
                            isSufficient
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isSufficient ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sufficient</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRawId(r.id);
                            setShowAdjustModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1b2230] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#2b3548] text-[11px] font-semibold transition-colors"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Menu Product Stocks Table (Page 29) */}
      {activeTab === 'products' && (
        <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Menu Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min. Threshold</th>
                  <th className="py-3 px-4">Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#18202d] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 text-slate-300">{p.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹{p.price}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{p.stock} Pieces</td>
                    <td className="py-3 px-4 font-mono text-slate-400">5 Pieces</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const delta = prompt(`Adjust stock for ${p.name} (enter + or - quantity, e.g. +10 or -5):`);
                          if (delta) {
                            const num = parseInt(delta);
                            if (!isNaN(num)) {
                              setProducts(products.map(prod => prod.id === p.id ? { ...prod, stock: Math.max(0, prod.stock + num) } : prod));
                              showToast(`Stock updated for ${p.name}`);
                            }
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#1b2230] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#2b3548] text-[11px] font-semibold transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Audit Log Table (Page 28) */}
      {activeTab === 'audit' && (
        <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Item Type</th>
                  <th className="py-3 px-4">Change Qty</th>
                  <th className="py-3 px-4">Previous → New Stock</th>
                  <th className="py-3 px-4">Audit Notes</th>
                  <th className="py-3 px-4 text-right">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#18202d] transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-orange-400">{log.type}</td>
                    <td className="py-3 px-4 text-slate-400">{log.itemType}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{log.changeQty}</td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                      {log.previousStock} → {log.newStock}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.notes}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Adjust Raw Ingredient Stock</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Ingredient</label>
                <select
                  value={selectedRawId}
                  onChange={(e) => setSelectedRawId(e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                >
                  {rawMaterials.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Current: {r.currentStock} {r.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Quantity Change (+ for adding, - for reduction)
                </label>
                <input
                  type="number"
                  step="any"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. +5 or -2.5"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason / Audit Notes</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical stock count discrepancy"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Raw Material Modal */}
      {showAddRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Add Raw Material</h3>
              <button onClick={() => setShowAddRawModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRawSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Material Name *</label>
                <input
                  type="text"
                  value={newRawName}
                  onChange={(e) => setNewRawName(e.target.value)}
                  placeholder="e.g. Organic Cocoa Powder"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newRawCode}
                    onChange={(e) => setNewRawCode(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newRawCat}
                    onChange={(e) => setNewRawCat(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    <option value="Coffee & Tea">Coffee & Tea</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Unit</label>
                  <select
                    value={newRawUnit}
                    onChange={(e) => setNewRawUnit(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    <option value="KG">KG</option>
                    <option value="Liter">Liter</option>
                    <option value="Piece">Piece</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={newRawStock}
                    onChange={(e) => setNewRawStock(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newRawMin}
                    onChange={(e) => setNewRawMin(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Unit Cost (₹)</label>
                <input
                  type="number"
                  value={newRawCost}
                  onChange={(e) => setNewRawCost(e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowAddRawModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Add Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
