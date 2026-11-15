import React, { useState } from 'react';
import { X, Search, UserPlus, Phone, Mail, Award, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomerSelectModal() {
  const { customers, setCustomers, selectedCustomer, setSelectedCustomer, closeModal, showToast, triggerAudio } = useApp();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (customer) => {
    triggerAudio('beep');
    setSelectedCustomer(customer);
    closeModal();
    showToast(`Linked customer ${customer.name} to bill`);
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('Name and phone are required', 'warning');
      return;
    }
    const created = {
      id: 'cust-' + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim().startsWith('+91') ? newPhone.trim() : `+91 ${newPhone.trim()}`,
      email: newEmail.trim() || '',
      ordersCount: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      notes: 'New member registered at POS'
    };
    setCustomers([created, ...customers]);
    handleSelect(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Customer Selection</h3>
            <p className="text-xs text-slate-400 mt-0.5">Search existing or register new customer</p>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & New Button */}
        <div className="p-3 bg-[#131720] border-b border-[#212837] flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mobile number or name..."
              className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-lg border border-[#2a3447] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New</span>
          </button>
        </div>

        {/* Quick Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreateCustomer} className="p-3 bg-[#161c28] border-b border-[#242e40] space-y-2">
            <div className="text-xs font-bold text-orange-400">Register New Customer</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-[#121620] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2a3447] focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Mobile (e.g. 9876543210) *"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-[#121620] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2a3447] focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="email"
                placeholder="Email address (optional)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 bg-[#121620] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2a3447] focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}

        {/* Customers List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No customers found. Click <strong>+ New</strong> to register.
            </div>
          ) : (
            filtered.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => handleSelect(cust)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/40'
                      : 'border-[#242e40] bg-[#141923] hover:bg-[#1a212e] hover:border-[#334159]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{cust.name}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                      <Phone className="w-2.5 h-2.5 text-slate-500" />
                      <span>{cust.phone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      ₹{cust.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {cust.ordersCount} orders
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
