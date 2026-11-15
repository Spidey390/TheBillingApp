import React, { useState } from 'react';
import { Plus, Shield, Zap, ChefHat, Edit, Trash2, X, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StaffPermissions() {
  const { staff, setStaff, showToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setRole('CASHIER');
    setPhone('+91 98765 ');
    setPin('1234');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);
    setPhone(s.phone);
    setPin(s.pin);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (staff.length <= 1) {
      showToast('Cannot delete the sole admin account', 'warning');
      return;
    }
    setStaff(staff.filter(s => s.id !== id));
    showToast('Staff member removed');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? {
        ...s,
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim(),
        pin: pin.trim()
      } : s));
      showToast('Staff member updated');
    } else {
      const newMember = {
        id: 'stf-' + Date.now(),
        name: name.trim(),
        email: email.trim() || `staff${staff.length + 1}@caffeflow.com`,
        role,
        phone: phone.trim() || '+91 98765 00000',
        pin: pin.trim() || '1111',
        status: 'Active'
      };
      setStaff([...staff, newMember]);
      showToast('Staff member added');
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Staff & Role Permissions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure access for Admin/Owners, Counter Cashiers, and Kitchen/Barista Staff.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Role Privilege Summary Cards (Page 35) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Admin Card */}
        <div className="bg-[#171c26] p-4 rounded-2xl border border-[#232a39] space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
            <Shield className="w-4 h-4" />
            <span>Admin (Owner)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Full system control, profit reports, product CRUD, inventory adjustments, expenses, and settings.
          </p>
        </div>

        {/* Cashier Card */}
        <div className="bg-[#171c26] p-4 rounded-2xl border border-[#232a39] space-y-2">
          <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>Counter Cashier</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            High-speed POS billing, orders view, customer lookup, thermal printing, and table selection.
          </p>
        </div>

        {/* Kitchen Card */}
        <div className="bg-[#171c26] p-4 rounded-2xl border border-[#232a39] space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen / Barista</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Kitchen Display System (KDS), order prep status updates, and floor table status tracking.
          </p>
        </div>
      </div>

      {/* Staff Table (Page 35) */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Quick PIN Code</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2636]">
              {staff.map((s) => {
                const isAdmin = s.role === 'ADMIN';
                const isCashier = s.role === 'CASHIER';
                return (
                  <tr key={s.id} className="hover:bg-[#18202d] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAdmin
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : isCashier
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{s.phone}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{s.pin}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Staff Member"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#252f42] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!isAdmin && (
                          <button
                            onClick={() => handleDelete(s.id)}
                            title="Remove Staff"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#252f42] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Cashier"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@caffeflow.com"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Quick PIN (4-digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] font-mono"
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
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
