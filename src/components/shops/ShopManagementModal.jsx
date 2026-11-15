import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Building2, 
  Check, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ShopManagementModal() {
  const { 
    shops, 
    activeShopId, 
    switchShop, 
    createShop, 
    closeModal, 
    staff 
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [phone, setPhone] = useState('+91 98765 ');
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createShop({
      name: name.trim(),
      code: code.trim().toUpperCase() || `BLR-${Math.floor(100 + Math.random() * 900)}`,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      phone: phone.trim(),
      gstin: gstin.trim()
    });

    setIsCreating(false);
    setName('');
    setCode('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-[#141924] border border-[#263143] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#10141d] border-b border-[#21293a] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Shop & Outlets Hub</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create new branches and switch live outlet operations
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Network Branches ({shops.length})
            </span>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isCreating ? 'View Branches' : 'Create New Shop'}</span>
            </button>
          </div>

          {/* Form: Create New Shop */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-[#171d2b] border border-[#253246] space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#242f42] pb-2">
                New Outlet Specification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Shop / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Brew & Bite - Whitefield"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Branch Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BLR-WHI"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none focus:border-orange-500 font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. #77, ITPL Main Road, Whitefield"
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#11151f] text-white px-3 py-2 rounded-xl border border-[#2b374c] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#242f42]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#1b2230] text-slate-300 font-semibold text-xs hover:bg-[#252f42]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                >
                  Create & Activate Branch
                </button>
              </div>
            </form>
          ) : (
            /* List of existing shops */
            <div className="space-y-2.5">
              {/* Option to Switch to Enterprise Consolidated View */}
              <div 
                onClick={() => { switchShop('all'); closeModal(); }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  activeShopId === 'all'
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-orange-500/50 shadow-md ring-1 ring-orange-500/40'
                    : 'bg-[#171c26] hover:bg-[#1d2432] border-[#252d3d]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">All Shops (Consolidated Enterprise)</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        GLOBAL VIEW
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aggregated sales, cross-branch analytics, and franchise totals
                    </p>
                  </div>
                </div>
                {activeShopId === 'all' ? (
                  <span className="text-xs font-bold text-orange-400 flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white flex items-center space-x-1">
                    <span>Switch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Outlet Cards */}
              {shops.map(shop => {
                const isSelected = activeShopId === shop.id;
                const shopStaffCount = staff.filter(s => s.shopId === shop.id).length;
                return (
                  <div
                    key={shop.id}
                    onClick={() => { switchShop(shop.id); closeModal(); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/50 shadow-md ring-1 ring-orange-500/40'
                        : 'bg-[#171c26] hover:bg-[#1d2432] border-[#252d3d]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2636] border border-[#2b374c] flex items-center justify-center text-orange-400 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white truncate">{shop.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e2636] text-slate-300 border border-[#2c384e]">
                            {shop.code}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{shop.address || shop.city}</span>
                          </span>
                          <span className="flex items-center space-x-1 shrink-0">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{shopStaffCount} Staff</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isSelected ? (
                        <span className="text-xs font-bold text-orange-400 flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button className="px-3 py-1.5 rounded-lg bg-[#1f2838] hover:bg-orange-500 hover:text-white text-slate-300 text-xs font-bold transition-colors">
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
