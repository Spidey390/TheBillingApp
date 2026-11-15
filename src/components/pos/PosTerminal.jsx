import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UtensilsCrossed, 
  ShoppingBag, 
  Truck, 
  Grid2X2, 
  UserPlus, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Check, 
  X,
  CreditCard,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PosTerminal() {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    updateCartItemNote,
    clearCart,
    orderChannel,
    setOrderChannel,
    selectedTable,
    setSelectedTable,
    selectedCustomer,
    setSelectedCustomer,
    discountPercent,
    setDiscountPercent,
    cartSubtotal,
    discountAmount,
    cgstAmount,
    sgstAmount,
    cartTotal,
    openModal,
    showToast,
    triggerAudio,
    isMobileCartOpen,
    setIsMobileCartOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'All Items' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.barcode.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleProductClick = (product) => {
    const hasProductAddons = (product.hasAddons && product.addons?.length > 0) || (product.addons?.length > 0);
    if (product.hasSizes || hasProductAddons) {
      openModal('customization', product);
    } else {
      addToCart(product);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const exactMatch = products.find(p => 
        p.barcode === searchQuery.trim() || 
        p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        handleProductClick(exactMatch);
        setSearchQuery('');
      } else if (filteredProducts.length === 1) {
        handleProductClick(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  const handleSaveNote = (cartItemId) => {
    updateCartItemNote(cartItemId, noteText);
    setEditingNoteId(null);
    setNoteText('');
  };

  // Reusable Cart Panel Inner Component
  const renderCartContent = (isDrawer = false) => (
    <div className="flex-1 flex flex-col justify-between h-full min-h-0 overflow-hidden bg-[#131822]">
      {/* Cart Header */}
      <div className="p-3 bg-[#161c28] border-b border-[#212a3a] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Current Order
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {orderChannel}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
            {selectedTable ? `Table: ${selectedTable.name}` : 'Counter Bill'} 
            {selectedCustomer ? ` • ${selectedCustomer.name}` : ''}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Cart (F1)"
            >
              Clear (F1)
            </button>
          )}
          {isDrawer && (
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="p-1 rounded-lg hover:bg-[#1f2738] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-0">
        {cart.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-[#19202e] border border-[#263145] flex items-center justify-center mb-3 text-slate-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-500 mt-1">Select items from the menu to punch bill</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-[#171d2a] border border-[#242e40] space-y-2 hover:border-[#303c53] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">{item.name}</h5>
                  {item.variant && (
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Size: {item.variant}
                    </span>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-[10px] text-emerald-400">
                      {item.addons.map(a => `+${a}`).join(', ')}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[10px] text-amber-300 italic mt-0.5 flex items-center space-x-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>{item.note}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeCartItem(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note edit row */}
              {editingNoteId === item.id ? (
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Kitchen instruction..."
                    className="flex-1 bg-[#10141d] text-xs text-slate-200 px-2 py-1 rounded border border-[#2b3547] focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveNote(item.id)}
                    className="p-1 rounded bg-emerald-600 text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="p-1 rounded bg-slate-700 text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingNoteId(item.id); setNoteText(item.note || ''); }}
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>{item.note ? 'Edit Note' : 'Add Note'}</span>
                </button>
              )}

              {/* Price and Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-[#202838]">
                <div className="text-xs font-mono font-bold text-white">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
                <div className="flex items-center space-x-2 bg-[#111620] px-1.5 py-0.5 rounded-lg border border-[#263143]">
                  <button
                    onClick={() => updateCartQuantity(item.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white min-w-[14px] text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Calculation Footer */}
      <div className="p-3 sm:p-4 bg-[#141a25] border-t border-[#212b3c] space-y-2.5 shrink-0">
        {/* Discount Pill Input */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-orange-400" />
            <span>Discount:</span>
          </span>
          <div className="flex items-center space-x-1">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                onClick={() => setDiscountPercent(pct)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  discountPercent === pct
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#1b2230] text-slate-400 hover:text-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-1 text-xs text-slate-400 pt-1.5 border-t border-[#202838]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">₹{cartSubtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[11px]">
            <span>CGST (2.5%)</span>
            <span className="font-mono text-slate-300">₹{cgstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>SGST (2.5%)</span>
            <span className="font-mono text-slate-300">₹{sgstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1.5 border-t border-[#232c3f]">
            <span className="text-sm font-bold text-white">Grand Total</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              ₹{cartTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Big Pay Button */}
        <button
          onClick={() => {
            if (cart.length > 0) {
              if (isDrawer) setIsMobileCartOpen(false);
              openModal('payment');
            } else {
              showToast('Add items to cart first', 'warning');
            }
          }}
          disabled={cart.length === 0}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
            cart.length > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>PAY ₹{cartTotal.toFixed(2)} (F4)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full min-h-0 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0e1218] relative">
      {/* Left Menu & Catalog Column */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col border-r border-[#1f2735] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-2 sm:p-2.5 bg-[#131720] border-b border-[#212837] flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Search Input */}
          <div className="flex items-center space-x-2 flex-1 min-w-[180px] sm:min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="pos-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search product (F2)..."
                className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-9 pr-7 py-1.5 rounded-lg border border-[#2b3547] focus:outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Shortcut Keys Indicators (Visible on 2xl only) */}
          <div className="hidden 2xl:flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-[#1f2838] border border-[#2b3548]">F1 New</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1f2838] border border-[#2b3548]">F2 Find</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1f2838] border border-[#2b3548]">F4 Pay</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1f2838] border border-[#2b3548]">F8 Table</span>
          </div>

          {/* Dine-In / Takeaway / Delivery Switcher */}
          <div className="flex items-center bg-[#181e2b] p-0.5 rounded-lg border border-[#283245] shrink-0">
            <button
              onClick={() => { setOrderChannel('Dine-In'); triggerAudio('beep'); }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                orderChannel === 'Dine-In'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-In</span>
            </button>
            <button
              onClick={() => { setOrderChannel('Takeaway'); triggerAudio('beep'); }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                orderChannel === 'Takeaway'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
            <button
              onClick={() => { setOrderChannel('Delivery'); triggerAudio('beep'); }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                orderChannel === 'Delivery'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Table & Customer Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {orderChannel === 'Dine-In' && (
              <button
                onClick={() => openModal('tableSelect')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedTable
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-[#1b2230] border-[#2b3547] text-slate-300 hover:bg-[#252f42]'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">
                  {selectedTable ? selectedTable.name : 'Table (F8)'}
                </span>
                {selectedTable && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setSelectedTable(null); }}
                    className="ml-1 text-slate-400 hover:text-rose-400"
                  >
                    ×
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => openModal('customerSelect')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedCustomer
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-[#1b2230] border-[#2b3547] text-slate-300 hover:bg-[#252f42]'
              }`}
            >
              {selectedCustomer ? <User className="w-3.5 h-3.5 text-purple-400" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[90px]">{selectedCustomer ? selectedCustomer.name : 'Customer'}</span>
              {selectedCustomer && (
                <span
                  onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }}
                  className="ml-1 text-slate-400 hover:text-rose-400"
                >
                  ×
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-3 py-1.5 bg-[#10141d] border-b border-[#1f2735] flex items-center space-x-1.5 overflow-x-auto select-none no-scrollbar shrink-0">
          <button
            onClick={() => setActiveCategory('All Items')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'All Items'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#171d28] text-slate-400 hover:text-slate-200 border border-[#232b39]'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(p => p.category === cat).length;
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-[#171d28] text-slate-400 hover:text-slate-200 border border-[#232b39]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6">
              <Search className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-xs sm:text-sm">No items found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5 gap-2.5">
              {filteredProducts.map((prod) => {
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="bg-[#161c27] hover:bg-[#1c2432] border border-[#232b3b] hover:border-orange-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    {/* Image with badges */}
                    <div className="relative aspect-[4/3] w-full bg-[#10141d] overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Veg / Non-Veg dot */}
                      <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded bg-white/90 border border-emerald-600 flex items-center justify-center p-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      </div>

                      {/* Customization badge */}
                      {prod.hasSizes ? (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-bold text-amber-300 border border-amber-500/30">
                          {prod.sizes.length} Sizes
                        </div>
                      ) : (prod.hasAddons && prod.addons?.length > 0) || prod.addons?.length > 0 ? (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                          Add-ons
                        </div>
                      ) : null}

                      {/* Stock badge */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-medium text-slate-300">
                        {prod.stock} left
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-orange-300 transition-colors line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                          ₹{prod.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(prod);
                          }}
                          className="w-6 h-6 rounded-md bg-orange-500/20 group-hover:bg-orange-500 text-orange-400 group-hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile/Tablet Sticky Bottom Bar (Visible on < lg screens when cart has items) */}
        {cart.length > 0 && (
          <div className="lg:hidden p-2.5 bg-[#141a25]/95 backdrop-blur-md border-t border-[#232c3f] flex items-center justify-between shrink-0 z-20">
            <div>
              <div className="text-[10px] text-slate-400">
                {cart.reduce((s, i) => s + i.quantity, 0)} items in bill
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                ₹{cartTotal.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-500/25 active:scale-95"
            >
              <span>View Cart & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Cart Column (Visible on lg and up) */}
      <div className="hidden lg:flex w-80 xl:w-96 shrink-0 h-full flex-col border-l border-[#202837] overflow-hidden">
        {renderCartContent(false)}
      </div>

      {/* Mobile/Tablet Slide-over Drawer Cart Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          {/* Slide-over panel */}
          <div className="relative w-full max-w-md bg-[#131822] h-full shadow-2xl flex flex-col z-10 border-l border-[#202837] animate-in slide-in-from-right duration-200">
            {renderCartContent(true)}
          </div>
        </div>
      )}
    </div>
  );
}
