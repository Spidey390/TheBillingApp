import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import { newId } from '../../domain/ids';
import { sanitizeText } from '../../domain/sanitize';

export default function CustomerCRM() {
  const { customers, saveCustomer, deleteCustomer } = useApp();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [detailsCustomerId, setDetailsCustomerId] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const detailsCustomer = customers.find(customer => customer.id === detailsCustomerId);

  const filtered = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()))
    );
  }, [customers, search]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setShowModal(true);
  };

  const closeEditor = () => {
    if (!isBusy) setShowModal(false);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const cleanName = sanitizeText(name, 100);
    const cleanPhone = sanitizeText(phone, 30);
    if (isBusy || !cleanName || !cleanPhone) return;
    setIsBusy(true);
    try {
      const saved = await saveCustomer({
        id: editingCustomer?.id || `cust-${newId()}`,
        name: cleanName,
        phone: cleanPhone,
        email: sanitizeText(email, 120),
        notes: sanitizeText(notes, 500)
      });
      if (saved) setShowModal(false);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (isBusy || !editingCustomer) return;
    if (!window.confirm('Remove this customer profile? Existing invoices will be retained.')) return;
    setIsBusy(true);
    try {
      if (await deleteCustomer(editingCustomer.id)) setShowModal(false);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-w-0 app-gutters py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Customer CRM & Loyalty</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track repeat visitors, order frequencies, spending history, and preferences.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-[#141923] p-4 rounded-2xl border border-[#232b3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-[#293345] focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="font-bold text-white">{customers.length}</span> customers
        </div>
      </div>

      {/* Customer Registry Table (Page 30) */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        <div className="xl:overflow-x-auto">
          <table role="table" aria-label="Customer profiles" className="responsive-records customer-records w-full text-left text-xs border-collapse min-w-[750px]">
            <thead role="rowgroup">
              <tr role="row" className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th role="columnheader" scope="col" className="py-3 px-4">Customer Name</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Mobile Phone</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Email</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Total Visits</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Gross Spend (₹)</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Avg. Order Value</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Customer Notes</th>
                <th role="columnheader" scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="divide-y divide-[#1e2636]">
              {!filtered.length && <tr role="row"><td role="cell" colSpan={8} className="record-empty px-4 py-6 text-sm text-slate-300">
                {search ? 'No customers match this search.' : 'No customer profiles yet. Select New Customer to add one.'}
              </td></tr>}
              {filtered.map((c) => (
                <tr role="row" key={c.id} className="hover:bg-[#18202d] transition-colors group">
                  <td role="cell" className="py-3 px-4 font-bold text-white record-title">{c.name}</td>
                  <td role="cell" className="py-3 px-4 font-mono text-emerald-400 font-medium customer-record-phone"><span className="record-label" aria-hidden="true">Phone</span>{c.phone}</td>
                  <td role="cell" className="py-3 px-4 text-slate-400 customer-record-extra"><span className="record-label" aria-hidden="true">Email</span>{c.email || '—'}</td>
                  <td role="cell" className="py-3 px-4 font-bold text-orange-400 font-mono customer-record-visits"><span className="record-label" aria-hidden="true">Visits</span>
                    {c.ordersCount} {c.ordersCount === 1 ? 'visit' : 'visits'}
                  </td>
                  <td role="cell" className="py-3 px-4 font-black font-mono text-white text-sm customer-record-extra"><span className="record-label" aria-hidden="true">Gross spend</span>
                    ₹{c.totalSpent.toFixed(2)}
                  </td>
                  <td role="cell" className="py-3 px-4 font-mono text-slate-300 customer-record-extra"><span className="record-label" aria-hidden="true">Average order</span>
                    ₹{c.avgOrderValue ? c.avgOrderValue.toFixed(1) : '0.0'}
                  </td>
                  <td role="cell" className="py-3 px-4 text-slate-400 max-w-xs truncate record-full customer-record-extra"><span className="record-label" aria-hidden="true">Notes</span>{c.notes || '—'}</td>
                  <td role="cell" className="py-3 px-4 text-right record-actions">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Customer"
                        aria-label={`Edit ${c.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#252f42] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsCustomerId(c.id)}
                        title="View details"
                        aria-label={`View details for ${c.name}`}
                        className="customer-record-view rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#252f42] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailsCustomer && (
        <Dialog label="Customer details" onClose={() => setDetailsCustomerId(null)}>
          <div className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#181e28] shadow-2xl">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
              <h2 className="min-w-0 break-words font-bold text-white">{detailsCustomer.name}</h2>
              <button type="button" aria-label="Close customer details" onClick={() => setDetailsCustomerId(null)}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-slate-700/50">
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>
            <dl className="grid min-h-0 grid-cols-2 gap-x-4 gap-y-4 overflow-y-auto p-4 text-sm">
              {[
                ['Mobile number', detailsCustomer.phone],
                ['Visits', detailsCustomer.ordersCount],
                ['Gross spend', `₹${detailsCustomer.totalSpent.toFixed(2)}`],
                ['Average order', `₹${(detailsCustomer.avgOrderValue || 0).toFixed(1)}`],
                ['Email', detailsCustomer.email || '—', true],
                ['Notes', detailsCustomer.notes || '—', true]
              ].map(([label, value, fullWidth]) => (
                <div key={label} className={fullWidth ? 'col-span-2 min-w-0' : 'min-w-0'}>
                  <dt className="mb-1 text-xs font-medium text-slate-400">{label}</dt>
                  <dd className="whitespace-pre-wrap break-words text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Dialog>
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <Dialog label="Customer profile" onClose={closeEditor}>
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md max-h-full overflow-y-auto shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button type="button" aria-label="Close" disabled={isBusy} onClick={closeEditor} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Customer Full Name *</label>
                <input aria-label="Customer Full Name"
                  type="text"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mobile Phone *</label>
                <input aria-label="Mobile Phone"
                  type="text"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input aria-label="Email Address"
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preferences & Notes</label>
                <textarea aria-label="Preferences & Notes"
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add customer notes"
                  rows={3}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-[#232b3a] pt-3">
                {editingCustomer && (
                  <button type="button" aria-label="Delete customer" disabled={isBusy} onClick={handleDelete}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold text-rose-300 hover:bg-rose-950/50 disabled:opacity-50">
                    <Trash2 className="size-4" aria-hidden="true" /> Delete
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" disabled={isBusy} onClick={closeEditor}
                    className="min-h-11 rounded-lg px-2 text-slate-400 hover:text-white disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isBusy}
                    className="min-h-11 rounded-lg bg-orange-500 px-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                    Save Customer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
}
