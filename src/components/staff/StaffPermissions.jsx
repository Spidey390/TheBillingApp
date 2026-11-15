import React, { useState } from 'react';
import { 
  Plus, 
  Shield, 
  Zap, 
  ChefHat, 
  Edit, 
  Trash2, 
  X, 
  Lock, 
  Store, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StaffPermissions() {
  const { staff, setStaff, shops, showToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');
  const [designation, setDesignation] = useState('Counter Cashier');
  const [shopId, setShopId] = useState(shops[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setRole('STAFF');
    setDesignation('Counter Cashier');
    setShopId(shops[0]?.id || '');
    setPhone('+91 98765 ');
    setPin('1234');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);
    setDesignation(s.designation || (s.role === 'OWNER' ? 'Enterprise Owner' : 'Staff'));
    setShopId(s.shopId || '');
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
        designation,
        shopId: role === 'OWNER' ? null : (shopId || null),
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
        designation,
        shopId: role === 'OWNER' ? null : (shopId || null),
        phone: phone.trim() || '+91 98765 00000',
        pin: pin.trim() || '1111',
        status: 'Active'
      };
      setStaff([...staff, newMember]);
      showToast(`Added ${newMember.name} to outlet team!`);
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Staff & Multi-Shop Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add team members and assign them to specific cafe outlets or global admin roles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Role Privilege Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner Card */}
        <div className="bg-[#171c26] p-4 rounded-2xl border border-[#232a39] space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
            <Shield className="w-4 h-4" />
            <span>ROLE: OWNER / ENTERPRISE ADMIN</span>
          </div>
          <p className="text-xs text-slate-300">
            Unrestricted access across all {shops.length} outlets. Can create new shops, switch branches live, view consolidated revenue, adjust inventory recipes, and manage staff.
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            Permissions: Full POS • KDS • Tables • All Shops Switching • GST Reports • Settings
          </div>
        </div>

        {/* Staff Card */}
        <div className="bg-[#171c26] p-4 rounded-2xl border border-[#232a39] space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <Users className="w-4 h-4" />
            <span>ROLE: OUTLET STAFF (CASHIER / KITCHEN)</span>
          </div>
          <p className="text-xs text-slate-300">
            Assigned to a single designated branch. Can punch orders, process cash/UPI payments, print KOTs, and manage tables for their specific outlet.
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            Permissions: POS Terminal • KDS Display • Tables Floor • Scoped to Assigned Shop
          </div>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-[#141924] rounded-2xl border border-[#21293a] overflow-hidden">
        <div className="p-4 border-b border-[#21293a] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            All Registered Personnel ({staff.length})
          </h3>
          <span className="text-xs text-slate-400">
            {shops.length} Outlets Managed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#11141c] text-slate-400 border-b border-[#1f2737]">
                <th className="py-3 px-4 font-semibold">Staff Member</th>
                <th className="py-3 px-4 font-semibold">Role & Title</th>
                <th className="py-3 px-4 font-semibold">Assigned Outlet</th>
                <th className="py-3 px-4 font-semibold">Quick PIN</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]">
              {staff.map((s) => {
                const isOwner = s.role === 'OWNER';
                const assignedShop = shops.find(shp => shp.id === s.shopId);

                return (
                  <tr key={s.id} className="hover:bg-[#181f2c] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOwner
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {s.role}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {s.designation || (isOwner ? 'Owner' : 'Staff')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isOwner ? (
                        <span className="flex items-center space-x-1 text-[11px] text-amber-400 font-bold">
                          <Store className="w-3.5 h-3.5" />
                          <span>All Outlets (Global)</span>
                        </span>
                      ) : assignedShop ? (
                        <div className="flex items-center space-x-1 text-slate-300">
                          <Store className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-semibold">{assignedShop.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">({assignedShop.code})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      •••• ({s.pin})
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {s.phone}
                    </td>
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
                        {!isOwner && (
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
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Staff Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Cashier"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143]"
                  >
                    <option value="STAFF">STAFF (Cashier / Counter)</option>
                    <option value="OWNER">OWNER (Full Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Head Cashier"
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143]"
                  />
                </div>
              </div>

              {/* Outlet Assignment (if not Owner) */}
              {role !== 'OWNER' && (
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Assign To Shop / Branch *
                  </label>
                  <select
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    required
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143] font-semibold"
                  >
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} ({shop.code}) • {shop.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@caffeflow.com"
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Quick PIN (4-digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-2 rounded-xl border border-[#263143] font-mono text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Phone Number</label>
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
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/25"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
