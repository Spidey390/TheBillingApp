import React, { useState, useMemo } from 'react';
import {
  Plus, Users, Zap, Trash2, X, Grid2X2,
  Receipt, CreditCard, ShoppingBag, Eye, Minus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import { calculateBill } from '../../domain/billing';
import { isTableOccupied } from '../../domain/tables';
import { sanitizeText } from '../../domain/sanitize';

function AddTableDialog({ saving, onClose, onSubmit, children }) {
  const close = () => { if (!saving) onClose(); };
  return (
    <Dialog label="Add table" onClose={close} className="items-center justify-center overflow-hidden p-3 sm:p-4">
      <form onSubmit={onSubmit}
        className="flex max-h-[min(92dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#171c26] shadow-2xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 px-4 py-4 sm:px-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300">
            <Grid2X2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="min-w-0 flex-1 text-lg font-bold text-white">Add a table</h3>
          <button type="button" aria-label="Close add table" disabled={saving} onClick={close}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5">
          <fieldset disabled={saving} className="min-w-0 space-y-3 text-sm sm:space-y-4">{children}</fieldset>
        </div>
        <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-700/60 bg-slate-950/25 px-4 py-3 sm:px-6">
          <button type="button" disabled={saving} onClick={close}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700/40 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-800 disabled:opacity-60">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Creating…' : 'Create table'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}

export default function TableManagement() {
  const {
    tables,
    createTable, deleteTable, isOwner,
    setSelectedTable,
    setActiveView,
    updateTableItemQuantity,
    removeTableItem,
    clearTableOrder,
    reviewTableCart,
    showToast,
    triggerAudio
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingTable, setSavingTable] = useState(false);
  const [activeOrderTableId, setActiveOrderTableId] = useState(null);

  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState(4);

  // Dynamically resolve currently opened table order from live tables state
  const activeOrderTable = useMemo(() => {
    return tables.find(t => t.id === activeOrderTableId) || null;
  }, [tables, activeOrderTableId]);

  const tableBill = table => calculateBill(table?.activeOrder?.items ?? [],
    table?.activeOrder?.discountPercent, table?.activeOrder?.fixedDiscount);
  const activeBill = tableBill(activeOrderTable);

  const handleLaunchPOS = async (table) => {
    triggerAudio('beep');
    if (!await setSelectedTable(table)) return;
    setActiveView('pos');
    const itemsCount = table.activeOrder?.items?.length || 0;
    if (itemsCount > 0) {
      showToast(`Loaded ${table.name} (${itemsCount} items) into POS Terminal`);
    } else {
      showToast(`Selected ${table.name} for new order in POS`);
    }
  };

  const handleDeleteTable = table => {
    if (window.confirm(`Remove “${table.name}”?`)) deleteTable(table.id);
  };

  const handleOpenAddTable = () => {
    let number = 1;
    const names = new Set(tables.map(table => table.name.trim().toLowerCase()));
    while (names.has(`table ${number}`)) number++;
    setNewName(`Table ${number}`);
    setNewSeats(4);
    setShowAddModal(true);
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (savingTable) return;
    const cleanName = sanitizeText(newName, 40);
    if (!cleanName) {
      showToast('Enter a table name.', 'warning');
      return;
    }

    const tableObj = {
      name: cleanName,
      seats: Number(newSeats) || 2,
      status: 'Available',
      currentOrderTotal: 0,
      activeOrder: null
    };
    setSavingTable(true);
    try {
      if (!await createTable(tableObj)) return;
    } finally {
      setSavingTable(false);
    }
    setShowAddModal(false);
    setNewName('');
  };

  const renderTableCard = (table) => {
    const activeItems = table.activeOrder?.items || [];
    const itemCount = activeItems.reduce((s, i) => s + i.quantity, 0);
    const isOccupied = isTableOccupied(table);
    const runningTotal = tableBill(table).total;

    return (
      <article key={table.id}
        className={`relative flex min-w-0 flex-col gap-3 rounded-xl border bg-[#141923] p-3 transition-colors hover:border-slate-600 sm:p-4 ${isOccupied
          ? 'border-orange-500/40'
          : 'border-[#232b3a]'}`}>
        <button type="button" tabIndex={isOccupied ? -1 : undefined} aria-label={`View table ${table.name}`}
          onClick={() => setActiveOrderTableId(table.id)}
          className="absolute inset-0 cursor-pointer rounded-xl" />
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words text-sm font-bold text-white sm:text-base">{table.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="size-3.5 shrink-0" aria-hidden="true" />
              {table.seats} {table.seats === 1 ? 'seat' : 'seats'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${isOccupied
              ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
              {isOccupied ? 'Occupied' : 'Available'}
            </span>
            {isOwner && !isOccupied && (
              <button type="button" aria-label={`Delete table ${table.name}`} title="Delete Table"
                onClick={() => handleDeleteTable(table)}
                className="relative z-10 grid size-11 place-items-center rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-300">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {isOccupied && (
          <div className="rounded-lg border border-orange-500/15 bg-[#10141d] p-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-slate-400">
              <span>Running bill · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="min-w-0 break-words text-sm font-bold tabular-nums text-emerald-300">
                ₹{runningTotal.toFixed(2)}
              </span>
            </div>
            <p className="mt-1 hidden truncate text-[11px] text-slate-400 sm:block">
              {activeItems.map(item => `${item.quantity}× ${item.name}`).join(', ')}
            </p>
          </div>
        )}

        {(isOccupied || !isOwner) && (
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            {isOccupied ? (
              <>
                <button type="button" onClick={() => setActiveOrderTableId(table.id)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2c374d] bg-[#1b2230] px-2 text-xs font-semibold text-slate-200 hover:bg-[#252f42]">
                  <Eye className="size-4 shrink-0 text-orange-300" aria-hidden="true" /> View order
                </button>
                {!isOwner && (
                  <>
                    <button type="button" aria-label="Add more items in POS" title="Add More Items in POS"
                      onClick={() => handleLaunchPOS(table)}
                      className="grid size-11 shrink-0 place-items-center rounded-lg border border-orange-500/25 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20">
                      <Zap className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => reviewTableCart(table)}
                      className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 text-xs font-bold text-white hover:bg-emerald-500">
                      <CreditCard className="size-4 shrink-0" aria-hidden="true" /> Review cart
                    </button>
                  </>
                )}
              </>
            ) : (
              <button type="button" onClick={() => handleLaunchPOS(table)}
                className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 text-xs font-semibold text-orange-300 hover:bg-orange-500/20">
                <Plus className="size-4" aria-hidden="true" /> Start order
              </button>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-4 app-gutters py-4 sm:space-y-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold text-white">Tables</h1>
        {isOwner && tables.length > 0 && (
          <button type="button" onClick={handleOpenAddTable}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800">
            <Plus className="size-4" aria-hidden="true" /> Add table
          </button>
        )}
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#232b3a] bg-[#141923] px-4 py-10 text-center sm:py-14">
          <div className="grid size-12 place-items-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
            <Grid2X2 className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-white">No tables yet</h2>
          {isOwner ? (
            <button type="button" onClick={handleOpenAddTable}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800">
              <Plus className="size-4" aria-hidden="true" /> Add table
            </button>
          ) : (
            <p className="text-sm text-slate-400">Ask the owner to add a table.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tables.map(renderTableCard)}
        </div>
      )}

      {/* Table Order Summary & Editing Modal */}
      {activeOrderTable && (
        <Dialog label="Table order" onClose={() => setActiveOrderTableId(null)}>
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Grid2X2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-white">{activeOrderTable.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isTableOccupied(activeOrderTable)
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isTableOccupied(activeOrderTable) ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeOrderTable.seats} {activeOrderTable.seats === 1 ? 'seat' : 'seats'}
                  </p>
                </div>
              </div>

              <button
                type="button" aria-label="Close" onClick={() => setActiveOrderTableId(null)}
                className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Active Ordered Items */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {activeOrderTable.activeOrder?.items?.length > 0 ? (
                <>
                  <div className="divide-y divide-[#202738] border border-[#232c3d] rounded-xl overflow-hidden bg-[#131722]">
                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-2 p-2.5 bg-[#10141d] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#232c3d]">
                      <div className="col-span-5">Item Details</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-3 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                    </div>

                    {activeOrderTable.activeOrder.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center text-xs hover:bg-[#18202e] transition-colors">
                        <div className="col-span-5">
                          <div className="font-bold text-white">{item.name}</div>
                          {item.variant && (
                            <div className="text-[10px] text-amber-400 font-medium">{item.variant}</div>
                          )}
                          {item.addons?.length > 0 && (
                            <div className="text-[10px] text-slate-400">{item.addons.join(', ')}</div>
                          )}
                          {item.note && (
                            <div className="text-[10px] text-slate-500 italic">"{item.note}"</div>
                          )}
                        </div>

                        <div className="col-span-2 text-right font-mono text-slate-300">
                          ₹{item.price.toFixed(2)}
                        </div>

                        {/* Direct Quantity Adjuster */}
                        <div className="col-span-3 flex items-center justify-center space-x-1.5">
                          {!isOwner && (<button
                            type="button"
                            aria-label={`Remove one ${item.name}`} onClick={() => updateTableItemQuantity(activeOrderTable.id, item.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#1a2232] hover:bg-[#253046] text-slate-300 hover:text-white flex items-center justify-center border border-[#2b374c] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>)}
                          <span className="w-6 text-center font-bold font-mono text-white text-xs">
                            {item.quantity}
                          </span>
                          {!isOwner && (<button
                            type="button"
                            aria-label={`Add one ${item.name}`} onClick={() => updateTableItemQuantity(activeOrderTable.id, item.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#1a2232] hover:bg-[#253046] text-slate-300 hover:text-white flex items-center justify-center border border-[#2b374c] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>)}
                          {!isOwner && (<button
                            type="button"
                            aria-label={`Remove ${item.name} from table`} onClick={() => removeTableItem(activeOrderTable.id, item.id)}
                            title="Remove item"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-[#232b3b] ml-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>)}
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-emerald-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Bill Summary */}
                  <div className="bg-[#131722] p-3.5 rounded-xl border border-[#232c3d] space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Items Subtotal:</span>
                      <span className="font-mono text-white">₹{activeBill.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {activeBill.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{activeOrderTable.activeOrder.fixedDiscount > 0
                          ? 'Discount' : `Discount (${activeOrderTable.activeOrder.discountPercent}%)`}</span>
                        <span className="font-mono">- ₹{activeBill.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#232c3d] text-sm font-black text-white">
                      <span>Grand Total:</span>
                      <span className="font-mono text-emerald-400 text-base">₹{activeBill.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#141923] border border-[#232b3a] flex items-center justify-center text-slate-500">
                    <ShoppingBag className="w-7 h-7 text-slate-600" />
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-sm font-bold text-white">No items on {activeOrderTable.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isOwner ? 'Orders for this table appear here.' : 'Start an order to add items from the menu.'}
                    </p>
                  </div>
                  {!isOwner && (<button
                    onClick={() => {
                      setActiveOrderTableId(null);
                      handleLaunchPOS(activeOrderTable);
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center space-x-1.5 transition-all mt-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Start Order in POS Terminal</span>
                  </button>)}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#141924] border-t border-[#232b3a] flex flex-wrap items-center justify-between gap-2 shrink-0">
              {activeOrderTable.activeOrder?.items?.length > 0 ? (
                <>
                  <div className="flex items-center space-x-2">
                    {!isOwner && (<button
                      type="button"
                      onClick={() => {
                        setActiveOrderTableId(null);
                        handleLaunchPOS(activeOrderTable);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#1a2232] hover:bg-[#253046] text-orange-400 font-bold text-xs border border-[#2c374c] flex items-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add More Items (POS)</span>
                    </button>)}
                    {!isOwner && (<button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Clear active order on “${activeOrderTable.name}” without billing?`)) {
                          clearTableOrder(activeOrderTable.id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#1a2232] hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-[#2c374c] transition-colors"
                    >
                      Clear Order
                    </button>)}

                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveOrderTableId(null)}
                      className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Close
                    </button>
                    {!isOwner && (<button
                      type="button"
                      onClick={() => {
                        const target = activeOrderTable;
                        setActiveOrderTableId(null);
                        reviewTableCart(target);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Review cart (₹{activeBill.total?.toFixed(2)})</span>
                    </button>)}
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveOrderTableId(null)}
                    className="px-4 py-2 rounded-xl bg-[#1a2232] text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {isOwner && showAddModal && (
        <AddTableDialog saving={savingTable} onSubmit={handleAddTable} onClose={() => setShowAddModal(false)}>
          <div className="space-y-1.5">
            <label htmlFor="new-table-name" className="block font-semibold text-slate-200">Table name</label>
            <input id="new-table-name" maxLength={40} value={newName} onChange={event => setNewName(event.target.value)}
              placeholder="Enter table name" required autoFocus
              className="block w-full rounded-lg border border-slate-700 bg-[#111620] px-3 py-2.5 text-base text-white" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-table-seats" className="block font-semibold text-slate-200">Seats</label>
            <div className="flex h-11 w-fit items-center rounded-lg border border-slate-700 bg-[#111620]">
              <button type="button" aria-label="Remove one seat" disabled={savingTable || Number(newSeats) <= 1}
                onClick={() => setNewSeats(Math.max(1, (Number(newSeats) || 1) - 1))}
                className="grid h-full w-10 shrink-0 place-items-center rounded-l-lg text-slate-300 hover:bg-slate-700/60 disabled:opacity-40">
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input id="new-table-seats" type="number" inputMode="numeric" min="1" max="50"
                value={newSeats} onChange={event => setNewSeats(event.target.value)}
                className="h-full w-12 appearance-none bg-transparent text-center text-base font-semibold tabular-nums text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <button type="button" aria-label="Add one seat" disabled={savingTable || Number(newSeats) >= 50}
                onClick={() => setNewSeats(Math.min(50, (Number(newSeats) || 0) + 1))}
                className="grid h-full w-10 shrink-0 place-items-center rounded-r-lg text-slate-300 hover:bg-slate-700/60 disabled:opacity-40">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </AddTableDialog>
      )}
    </div>
  );
}
