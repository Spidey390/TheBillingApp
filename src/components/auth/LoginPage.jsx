import React, { useState } from 'react';
import { 
  Coffee, 
  ShieldCheck, 
  User, 
  Store, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Database,
  Lock,
  Building2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { staff, shops, login, showToast } = useApp();

  const [roleMode, setRoleMode] = useState('OWNER'); // 'OWNER' or 'STAFF'
  
  // Owner Credentials Form
  const [ownerEmail, setOwnerEmail] = useState('admin@caffeflow.com');
  const [ownerPin, setOwnerPin] = useState('1122');

  // Staff Credentials Form
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id || 'shop-1');
  const [selectedStaffId, setSelectedStaffId] = useState(
    staff.find(s => s.role === 'STAFF')?.id || ''
  );
  const [staffPin, setStaffPin] = useState('');

  // Find owner account
  const ownerAccount = staff.find(s => s.role === 'OWNER') || {
    id: 'stf-1',
    name: 'Rajesh Kumar (Owner)',
    email: 'admin@caffeflow.com',
    role: 'OWNER',
    designation: 'Enterprise Owner & Founder',
    pin: '1122'
  };

  // Filter staff by selected shop
  const shopStaffList = staff.filter(s => 
    s.role === 'STAFF' && (!s.shopId || s.shopId === selectedShopId)
  );

  const handleOwnerSubmit = (e) => {
    e?.preventDefault();
    if (ownerPin === ownerAccount.pin || ownerPin === '1122') {
      login(ownerAccount);
    } else {
      showToast('Incorrect Owner PIN. Use 1122 for Demo.', 'error');
    }
  };

  const handleStaffSubmit = (e) => {
    e?.preventDefault();
    const staffMember = staff.find(s => s.id === selectedStaffId);
    if (!staffMember) {
      showToast('Please select a staff member', 'warning');
      return;
    }
    if (staffPin && staffPin !== staffMember.pin) {
      showToast(`Invalid PIN for ${staffMember.name}. Hint: PIN is ${staffMember.pin}`, 'error');
      return;
    }
    // Assign to selected shop if not already assigned
    login({ ...staffMember, shopId: selectedShopId });
  };

  const handleKeypadPress = (digit) => {
    if (roleMode === 'OWNER') {
      if (ownerPin.length < 6) setOwnerPin(prev => prev + digit);
    } else {
      if (staffPin.length < 6) setStaffPin(prev => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    if (roleMode === 'OWNER') {
      setOwnerPin(prev => prev.slice(0, -1));
    } else {
      setStaffPin(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen h-[100dvh] w-screen bg-[#0a0d14] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans text-slate-100">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-4xl bg-[#121622] border border-[#242d40] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Left Side: Brand & Feature Highlights */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#161c2b] to-[#0e121a] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#20293b]">
          <div>
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/50">
                <Coffee className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">
                  Brew & Bite Cafe
                </h1>
                <p className="text-xs text-orange-400 font-semibold tracking-wide">
                  Enterprise POS & Multi-Outlet
                </p>
              </div>
            </div>

            {/* Description */}
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
              One Unified POS Across All Your Shops
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Empower your cafe empire with multi-branch management, instant outlet switching, staff-level access, and 100% offline-first IndexedDB resilience.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <Store className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Multi-Shop Engine:</strong> Create and switch between infinite outlets from a single master dashboard.</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Role Restrictions:</strong> Cashiers & Baristas locked to their branch; Owners get global consolidated analytics.</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">ACID IndexedDB:</strong> Offline-first transactional database with zero cloud fees.</span>
              </div>
            </div>
          </div>

          {/* Bottom Free Lifetime Badge */}
          <div className="mt-6 pt-4 border-t border-[#1e2738] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              ₹0/MO LIFETIME
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Enterprise v2.4
            </span>
          </div>
        </div>

        {/* Right Side: Role Selector & Login Form */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-[#121622]">
          <div>
            {/* Role Tabs Header */}
            <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                SELECT YOUR ACCESS ROLE
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0d1017] rounded-2xl border border-[#21293a]">
                <button
                  type="button"
                  onClick={() => setRoleMode('OWNER')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    roleMode === 'OWNER'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Owner / Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('STAFF')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    roleMode === 'STAFF'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Staff / Cashier</span>
                </button>
              </div>
            </div>

            {/* OWNER LOGIN FORM */}
            {roleMode === 'OWNER' ? (
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>Owner: {ownerAccount.name}</span>
                    </div>
                    <div className="text-[11px] text-orange-400/90 mt-0.5">
                      Full Enterprise Access • All {shops.length} Outlets Managed
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    MASTER
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Owner Email / Account
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-[#181f2c] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[#2b3548] focus:outline-none focus:border-orange-500 font-mono"
                    placeholder="admin@caffeflow.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400 font-semibold">
                      Security PIN (Default: 1122)
                    </label>
                    <span className="text-[10px] text-orange-400">PIN: 1122</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      value={ownerPin}
                      onChange={(e) => setOwnerPin(e.target.value)}
                      placeholder="Enter 4-digit PIN..."
                      className="w-full bg-[#181f2c] text-white text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#2b3548] focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                >
                  <span>Launch Master Owner Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Demo Shortcut */}
                <button
                  type="button"
                  onClick={() => login(ownerAccount)}
                  className="w-full py-2 rounded-xl bg-[#1a2232] hover:bg-[#232e42] text-slate-300 font-semibold text-xs border border-[#29364d] transition-colors"
                >
                  ⚡ Fast 1-Click Login as Owner (All Shops)
                </button>
              </form>
            ) : (
              /* STAFF LOGIN FORM */
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                {/* Step 1: Branch / Outlet Selector */}
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    1. Select Working Outlet / Branch *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedShopId}
                      onChange={(e) => {
                        setSelectedShopId(e.target.value);
                        const firstStaff = staff.find(s => s.role === 'STAFF' && s.shopId === e.target.value);
                        if (firstStaff) setSelectedStaffId(firstStaff.id);
                      }}
                      className="w-full bg-[#181f2c] text-white text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#2b3548] focus:outline-none focus:border-orange-500 font-semibold appearance-none cursor-pointer"
                    >
                      {shops.map(shop => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name} ({shop.code}) • {shop.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2: Staff Member Selector */}
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    2. Choose Staff Profile *
                  </label>
                  {shopStaffList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {shopStaffList.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedStaffId(s.id);
                            setStaffPin(s.pin || '');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedStaffId === s.id
                              ? 'bg-orange-500/15 border-orange-500/50 text-white ring-1 ring-orange-500'
                              : 'bg-[#181f2c] border-[#29354a] text-slate-300 hover:bg-[#20293b]'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{s.name}</div>
                          <div className="text-[10px] text-orange-400 truncate">
                            {s.designation || s.role} • PIN: {s.pin}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#181f2c] border border-[#29354a] text-xs text-slate-400 text-center">
                      No staff assigned yet to this outlet.
                    </div>
                  )}
                </div>

                {/* PIN Input */}
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    3. Staff PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value)}
                      placeholder="Enter Staff PIN..."
                      className="w-full bg-[#181f2c] text-white text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#2b3548] focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                >
                  <span>Clock-In to Outlet POS Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Quick PIN Keypad Helper */}
          <div className="mt-4 pt-3 border-t border-[#1f283a]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Touch Numeric Keypad
            </div>
            <div className="grid grid-cols-6 gap-1.5 max-w-sm mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num.toString())}
                  className="h-8 rounded-lg bg-[#181f2c] hover:bg-[#232d3f] border border-[#2b374c] text-xs font-bold text-white transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="col-span-2 h-8 rounded-lg bg-[#1f2636] hover:bg-rose-900/30 hover:text-rose-300 border border-[#2b374c] text-[11px] font-bold text-slate-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
