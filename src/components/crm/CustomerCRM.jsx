import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X, Phone, Mail, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomerCRM() {
  const { customers, setCustomers, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim()
      } : c));
      showToast('Customer profile updated');
    } else {
      const newCust = {
        id: 'cust-' + Date.now(),
        name: name.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        email: email.trim(),
        ordersCount: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        notes: notes.trim() || 'Counter visitor'
      };
      setCustomers([...customers, newCust]);
      showToast('New customer registered');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
    showToast('Customer profile removed');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile Phone</th>
                <th className="py-3 px-4">Email / City</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Total Spent (₹)</th>
                <th className="py-3 px-4">Avg. Order Value</th>
                <th className="py-3 px-4">Customer Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2636]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#18202d] transition-colors group">
                  <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{c.phone}</td>
                  <td className="py-3 px-4 text-slate-400">{c.email || '—'}</td>
                  <td className="py-3 px-4 font-bold text-orange-400 font-mono">
                    {c.ordersCount} visits
                  </td>
                  <td className="py-3 px-4 font-black font-mono text-white text-sm">
                    ₹{c.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    ₹{c.avgOrderValue ? c.avgOrderValue.toFixed(1) : '0.0'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{c.notes || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Customer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#252f42] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete Customer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#252f42] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98451 23456"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.s@gmail.com"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preferences & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular cappuccino lover. Prefers less sugar."
                  rows={3}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
