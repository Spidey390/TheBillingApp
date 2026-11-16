import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';

export default function ItemCustomizationModal() {
  const { modalData, closeModal, addToCart } = useApp();
  const product = modalData;

  const productAddons = product?.hasAddons === false ? [] : product?.addons ?? [];

  // Defaults
  const [selectedVariant, setSelectedVariant] = useState(
    product?.hasSizes ? product.sizes?.[0] ?? null : null
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [instruction, setInstruction] = useState('');

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => (a.id && a.id === addon.id) || a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => (a.id ? a.id !== addon.id : a.name !== addon.name)));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  if (!product) return null;

  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const currentTotal = basePrice + addonTotal;

  const handleAdd = async () => {
    if (await addToCart(product, selectedVariant, selectedAddons, instruction)) closeModal();
  };

  const isVeg = product.dietary !== 'Non-Veg';

  return (
    <Dialog label="Customize item" onClose={closeModal}>
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header without photo */}
        <div className="p-4 sm:p-5 border-b border-[#2b3547] bg-[#141923] flex items-start justify-between shrink-0">
          <div className="space-y-1.5 pr-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3.5 h-3.5 rounded bg-white/90 border ${
                  isVeg ? 'border-emerald-600' : 'border-rose-600'
                } flex items-center justify-center p-0.5 shrink-0`}
                title={product.dietary || 'Pure Veg'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                ></span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {product.category}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {product.name}
            </h2>
            <div className="text-xs font-semibold text-slate-400">
              Base Price: <span className="text-white font-mono font-bold">₹{product.price}</span>
            </div>
          </div>

          <button
            type="button" aria-label="Close" onClick={closeModal}
            className="w-8 h-8 rounded-xl bg-[#1e2533] hover:bg-[#283244] text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Options */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Sizes / Variants */}
          {product.hasSizes && product.sizes?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Choose Size / Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedVariant?.name === size.name;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedVariant(size)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/50'
                          : 'border-[#263143] bg-[#141923] text-slate-300 hover:bg-[#1a212e]'
                      }`}
                    >
                      <span className="truncate">{size.name}</span>
                      <span className="font-mono font-bold">₹{size.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons & Customizations */}
          {productAddons.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Add-ons / Customizations
              </label>
              <div className="space-y-1.5 bg-[#141923] p-2 rounded-xl border border-[#232b3a]">
                {productAddons.map((addon) => {
                  const isChecked = selectedAddons.some(a => (a.id && a.id === addon.id) || a.name === addon.name);
                  return (
                    <label
                      key={addon.id || addon.name}
                      onClick={() => toggleAddon(addon)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1b2230] cursor-pointer text-xs select-none transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-[#38455c] bg-[#111620]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-slate-200">{addon.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">+₹{addon.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Special Instructions
            </label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter special instructions"
              className="w-full bg-[#141923] text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-[#141924] border-t border-[#232b3a] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Item Price</span>
            <span className="text-base font-black text-white font-mono">₹{currentTotal}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
            >
              + Add to Bill
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
