import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ItemCustomizationModal() {
  const { modalData, closeModal, addToCart } = useApp();
  const product = modalData;

  if (!product) return null;

  // Defaults to first size variant
  const [selectedVariant, setSelectedVariant] = useState(
    product.sizes?.[0] || null
  );
  const [instruction, setInstruction] = useState('');

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAdd = () => {
    addToCart(product, selectedVariant, [], instruction);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header preview */}
        <div className="relative h-44 w-full bg-[#10141d] shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181e28] via-[#181e28]/50 to-transparent"></div>

          <button
            onClick={closeModal}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white">
              {product.category}
            </span>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Options: Sizes / Variants & Kitchen Instruction only */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Sizes / Variants */}
          {product.sizes && product.sizes.length > 0 && (
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
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
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

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Special Kitchen Instruction
            </label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Less sugar, extra hot, no onions"
              className="w-full bg-[#141923] text-xs text-white placeholder-slate-500 px-3 py-2.5 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-[#141924] border-t border-[#232b3a] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-lg font-black text-white font-mono">₹{currentPrice}</span>
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
    </div>
  );
}
