import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  UtensilsCrossed, 
  ShoppingBag, 
  Truck, 
  Grid2X2, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Check, 
  X,
  CreditCard,
  MessageSquare,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  UserRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import FilterDialog from '../layout/FilterDialog';
import CustomerSelectModal from './CustomerSelectModal';
import CustomItemDialog from './CustomItemDialog';
import DiscountDialog from './DiscountDialog';

const allItems = 'All Items';
const orderChannels = [
  { value: 'Dine-In', label: 'Dine-in', icon: UtensilsCrossed },
  { value: 'Takeaway', label: 'Takeaway', icon: ShoppingBag },
  { value: 'Delivery', label: 'Delivery', icon: Truck }
];
const linkedControl = 'flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold hover:bg-slate-700/40 sm:text-sm';
const unlinkControl = 'grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white';
const cartAction = 'flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl border border-[#2b3547] bg-[#171d2a] px-2.5 py-2 text-left text-sm font-semibold text-slate-100 hover:border-orange-500/40 hover:bg-slate-800 disabled:opacity-60';

export default function PosTerminal() {
  const {
    products, settings, isDraftSaving,
    categories,
    cart,
    addToCart,
    addCustomCartItem,
    updateCartQuantity,
    removeCartItem,
    updateCartItemNote,
    clearCart,
    orderChannel,
    setOrderChannel,
    selectedTable,
    setSelectedTable,
    selectedCustomer,
    setCartCustomer,
    paymentRevision,
    discountPercent,
    fixedDiscount,
    setCartDiscount,
    cartSubtotal,
    discountAmount,
    cartTotal,
    openModal,
    showToast,
    triggerAudio,
    isMobileCartOpen,
    setIsMobileCartOpen
  } = useApp();

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeDrawer = event => { if (event.matches) setIsMobileCartOpen(false); };
    desktop.addEventListener('change', closeDrawer);
    return () => desktop.removeEventListener('change', closeDrawer);
  }, [setIsMobileCartOpen]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(allItems);
  const [showCategories, setShowCategories] = useState(false);
  const [showOrderTypes, setShowOrderTypes] = useState(false);
  const [customerPickerRevision, setCustomerPickerRevision] = useState(null);
  const [customItemRevision, setCustomItemRevision] = useState(null);
  const [discountEditorRevision, setDiscountEditorRevision] = useState(null);
  const hasDiscount = discountPercent > 0 || fixedDiscount > 0;
  const { label: orderType, icon: OrderTypeIcon } = orderChannels.find(channel => channel.value === orderChannel) ?? orderChannels[0];

  const categoryOptions = useMemo(() => {
    const counts = new Map();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return [{ value: allItems, count: products.length },
      ...categories.map(value => ({ value, count: counts.get(value) ?? 0 }))];
  }, [categories, products]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === allItems || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleProductClick = (product) => {
    if (isDraftSaving) return;
    const hasProductAddons = product.hasAddons !== false && product.addons?.length > 0;
    if ((product.hasSizes && product.sizes?.length > 0) || hasProductAddons) {
      openModal('customization', product);
    } else {
      addToCart(product);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && !isDraftSaving && searchQuery.trim()) {
      e.preventDefault();
      const query = searchQuery.trim().toLowerCase();
      const matches = products.filter(product =>
        product.sku?.toLowerCase() === query || product.name.toLowerCase() === query);
      if (matches.length > 1) {
        showToast('Multiple products use this code. Select the intended product.', 'warning');
      } else if (matches.length === 1) {
        handleProductClick(matches[0]);
        setSearchQuery('');
      } else if (filteredProducts.length === 1) {
        handleProductClick(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  const handleSaveNote = async (cartItemId) => {
    if (!await updateCartItemNote(cartItemId, noteText)) return;
    setEditingNoteId(null);
    setNoteText('');
  };

  function changeOrderType(value) {
    setOrderChannel(value);
    triggerAudio('beep');
    setShowOrderTypes(false);
  }

  // Reusable Cart Panel Inner Component
  const renderCartContent = (isDrawer = false) => (
    <div className="flex-1 flex flex-col justify-between h-full min-h-0 overflow-hidden bg-[#131822]">
      {/* Cart Header */}
      <div className="px-3 py-3 sm:px-4 bg-[#161c28] border-b border-[#212a3a] flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Current Order
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {orderChannel}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
            {selectedTable ? selectedTable.name : 'Counter bill'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Cart"
            >
              Clear Cart
            </button>
          )}
          {isDrawer && (
            <button
              aria-label="Close cart" onClick={() => setIsMobileCartOpen(false)}
              className="p-1 rounded-lg hover:bg-[#1f2738] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 px-3 py-3 sm:px-4 overflow-y-auto space-y-2.5 min-h-0">
        <div className="flex items-center rounded-xl border border-[#2b3547] bg-[#171d2a]">
          <button type="button" aria-label={selectedCustomer ? 'Change customer' : 'Select customer'}
            aria-haspopup="dialog" disabled={isDraftSaving} onClick={() => setCustomerPickerRevision(paymentRevision)}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-slate-800 disabled:opacity-60">
            <UserRound className="size-4 shrink-0 text-orange-300" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-slate-400">Customer</span>
              <span className="block truncate text-sm font-semibold text-slate-100">{selectedCustomer?.name || 'Walk-in guest'}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button>
          {selectedCustomer && (
            <button type="button" aria-label="Unlink customer" disabled={isDraftSaving} onClick={() => setCartCustomer(null)}
              className="mr-1 grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-60">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="min-h-[160px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-[#19202e] border border-[#263145] flex items-center justify-center mb-3 text-slate-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-500 mt-1">Choose an item from the menu or add a custom item.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-[#171d2a] border border-[#242e40] space-y-2 hover:border-[#303c53] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 [overflow-wrap:anywhere]">
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
                  disabled={isDraftSaving} aria-label={`Remove ${item.name}`} onClick={() => removeCartItem(item.id)}
                  className="shrink-0 text-slate-500 hover:text-rose-400 transition-colors p-1"
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
                    placeholder="Item note..."
                    className="flex-1 bg-[#10141d] text-xs text-slate-200 px-2 py-1 rounded border border-[#2b3547] focus:outline-none"
                  />
                  <button
                    aria-label="Save item note" disabled={isDraftSaving} onClick={() => handleSaveNote(item.id)}
                    className="p-1 rounded bg-emerald-600 text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    aria-label="Cancel item note" onClick={() => setEditingNoteId(null)}
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
                    aria-label={`Remove one ${item.name}`} disabled={isDraftSaving} onClick={() => updateCartQuantity(item.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white min-w-[14px] text-center font-mono">
                    {item.quantity}
                  </span>
                  <button
                    aria-label={`Add one ${item.name}`} disabled={isDraftSaving} onClick={() => updateCartQuantity(item.id, 1)}
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
      <div className="px-3 py-3 sm:p-4 bg-[#141a25] border-t border-[#212b3c] space-y-2.5 shrink-0">
        <div className={`grid gap-2 ${settings.allowCashierDiscounts ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {settings.allowCashierDiscounts && (
            <button type="button" aria-haspopup="dialog" disabled={isDraftSaving}
              aria-label={hasDiscount ? 'Edit discount' : 'Add discount'}
              onClick={() => setDiscountEditorRevision(paymentRevision)} className={cartAction}>
              <Tag className="size-4 shrink-0 text-orange-300" aria-hidden="true" />
              <span className="flex-1">Discount</span>
              <span className="text-xs text-orange-200">{hasDiscount ? 'Edit' : 'Add'}</span>
            </button>
          )}
          <button type="button" aria-haspopup="dialog" disabled={isDraftSaving}
            onClick={() => setCustomItemRevision(paymentRevision)} className={cartAction}>
            <Plus className="size-4 shrink-0 text-orange-300" aria-hidden="true" />
            Custom item
          </button>
        </div>

        {/* Breakdown */}
        <div className="space-y-1 text-xs text-slate-400 pt-1.5 border-t border-[#202838]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">₹{cartSubtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>{fixedDiscount > 0 ? 'Discount' : `Discount (${discountPercent}%)`}</span>
              <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
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
          disabled={cart.length === 0 || isDraftSaving}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
            cart.length > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isDraftSaving ? 'Saving table…' : `PAY ₹${cartTotal.toFixed(2)}`}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full min-h-0 min-w-0 flex flex-col lg:flex-row overflow-hidden bg-[#0e1218] relative">
      {/* Left Menu & Catalog Column */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col border-r border-[#1f2735] overflow-hidden">
        <div role="group" aria-label="POS controls"
          className="app-gutters grid shrink-0 grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-2 border-b border-[#212837] bg-[#131720] py-2 sm:grid-cols-[minmax(0,1fr)_minmax(17rem,auto)] sm:py-2.5">
          <div className="col-span-2 flex min-w-0 gap-2 sm:col-span-1">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input id="pos-search-input" aria-label="Search products" type="text"
                value={searchQuery} onChange={event => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown} placeholder="Search"
                className="h-11 w-full min-w-0 rounded-lg border border-[#2b3547] bg-[#1b2230] pl-9 pr-10 text-base text-white placeholder:text-slate-400 sm:text-sm" />
              {searchQuery && (
                <button type="button" aria-label="Clear product search" onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 grid size-11 place-items-center rounded-lg text-slate-400 hover:text-white">
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <button type="button" aria-haspopup="dialog" aria-label={`Categories, ${activeCategory} selected`}
              onClick={() => setShowCategories(true)}
              className={`inline-flex min-h-11 max-w-[48%] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold sm:hidden ${activeCategory === allItems
                ? 'border-[#2b3547] bg-[#1b2230] text-slate-200'
                : 'border-orange-500/40 bg-orange-500/10 text-orange-200'}`}>
              <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{activeCategory === allItems ? 'Categories' : activeCategory}</span>
            </button>
          </div>

          <button type="button" aria-label={`Order type: ${orderType}`} aria-haspopup="dialog"
            disabled={isDraftSaving} onClick={() => setShowOrderTypes(true)}
            className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-lg border border-orange-500/35 bg-orange-500/10 px-2.5 text-xs font-semibold text-orange-200 hover:bg-orange-500/20 disabled:opacity-60 sm:hidden">
            <OrderTypeIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-left">{orderType}</span>
            <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
          </button>

          <div role="group" aria-label="Order type" className="hidden grid-cols-3 gap-0.5 rounded-xl border border-[#283245] bg-[#10141d] p-0.5 sm:grid">
            {orderChannels.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" aria-pressed={orderChannel === value}
                onClick={() => changeOrderType(value)}
                className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold ${orderChannel === value
                  ? 'bg-orange-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="size-3.5 shrink-0" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {orderChannel === 'Dine-In' && (
            <div className={`flex min-w-0 max-w-full items-center rounded-lg border sm:w-fit ${selectedTable
              ? 'border-orange-500/40 bg-orange-500/10 text-orange-200'
              : 'border-[#2b3547] bg-[#1b2230] text-slate-300'}`}>
              <button type="button" onClick={() => openModal('tableSelect')} className={linkedControl}>
                <Grid2X2 className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{selectedTable?.name || 'Select Table'}</span>
              </button>
              {selectedTable && (
                <button type="button" title="Switch to counter bill" aria-label="Switch to counter bill"
                  onClick={() => setSelectedTable(null)} className={unlinkControl}>
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>

        <div role="group" aria-label="Product categories"
          className="app-gutters hidden shrink-0 items-center gap-1.5 overflow-x-auto border-b border-[#1f2735] bg-[#10141d] py-2 sm:flex">
          {categoryOptions.map(({ value, count }) => (
            <button key={value} type="button" aria-pressed={activeCategory === value} onClick={() => setActiveCategory(value)}
              className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold ${activeCategory === value
                ? 'border-orange-500/35 bg-orange-500/10 text-orange-200'
                : 'border-[#232b39] bg-[#171d28] text-slate-300 hover:bg-slate-800'}`}>
              {value} ({count})
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 app-gutters py-2 sm:py-3 overflow-y-auto min-h-0">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6">
              <Search className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-xs sm:text-sm">No items found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1800px]:grid-cols-5 gap-2.5">
              {filteredProducts.map((prod) => {
                const isVeg = prod.dietary !== 'Non-Veg';
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="bg-[#161c27] hover:bg-[#1c2432] active:scale-[0.99] border border-[#232b3b] hover:border-orange-500/50 rounded-xl p-3 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-sm hover:shadow-md min-h-[110px]"
                  >
                    <div>
                      {/* Top metadata row */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div
                            className={`w-3.5 h-3.5 rounded bg-white/90 border ${
                              isVeg ? 'border-emerald-600' : 'border-rose-600'
                            } flex items-center justify-center p-0.5 shrink-0`}
                            title={prod.dietary || 'Pure Veg'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            ></span>
                          </div>
                          <span className="text-[10px] text-slate-400 truncate uppercase font-semibold tracking-wider">
                            {prod.category}
                          </span>
                        </div>

                        {prod.hasSizes && prod.sizes?.length > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[9px] font-bold text-amber-400 border border-amber-500/30 shrink-0">
                            {prod.sizes?.length ?? 0} Sizes
                          </span>
                        ) : prod.hasAddons !== false && prod.addons?.length > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 shrink-0">
                            Add-ons
                          </span>
                        ) : null}
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Bottom row: Price & Add button */}
                    <div className="mt-3 pt-2 border-t border-[#202737] flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                          ₹{prod.price}
                        </span>
                        {prod.hasSizes && prod.sizes?.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1">onwards</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(prod);
                        }}
                        className="w-7 h-7 rounded-lg bg-orange-500/15 group-hover:bg-orange-500 text-orange-400 group-hover:text-white flex items-center justify-center transition-all duration-150 shadow-sm"
                        disabled={isDraftSaving} aria-label={`Add ${prod.name}`} title={`Add ${prod.name}`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile and tablet cart bar */}
        <div className="lg:hidden app-gutters py-2.5 bg-[#141a25]/95 backdrop-blur-md border-t border-[#232c3f] flex items-center justify-between shrink-0 z-20">
          <div>
            <div className="text-[10px] text-slate-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} items in bill
            </div>
            <div className="text-sm font-extrabold text-white font-mono">
              ₹{cartTotal.toFixed(2)}
            </div>
          </div>
          <button type="button" onClick={() => setIsMobileCartOpen(true)}
            className="min-h-11 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-500/25 active:scale-95">
            <span>{cart.length ? 'View Cart & Pay' : 'View cart'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Desktop Cart Column (Visible on lg and up) */}
      <div className="hidden lg:flex w-80 xl:w-96 shrink-0 h-full flex-col border-l border-[#202837] overflow-hidden">
        {renderCartContent(false)}
      </div>

      {showCategories && (
        <FilterDialog title="Categories"
          groups={[{ name: 'category', label: 'Product category', value: activeCategory, options: categoryOptions }]}
          onApply={({ category }) => setActiveCategory(category)} onClose={() => setShowCategories(false)} />
      )}

      {showOrderTypes && (
        <Dialog label="Order type" onClose={() => setShowOrderTypes(false)}>
          <section className="w-full max-w-xs rounded-2xl border border-slate-700 bg-[#171c26] shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-700/60 px-4 py-2">
              <h2 className="font-bold text-white">Order type</h2>
              <button type="button" aria-label="Close order type" onClick={() => setShowOrderTypes(false)}
                className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-slate-700/50">
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>
            <div className="space-y-1 p-3">
              {orderChannels.map(({ value, label, icon: Icon }) => {
                const selected = orderChannel === value;
                return (
                  <button key={value} type="button" aria-pressed={selected} disabled={isDraftSaving}
                    onClick={() => changeOrderType(value)}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold disabled:opacity-60 ${selected
                      ? 'bg-orange-500/10 text-orange-200'
                      : 'text-slate-200 hover:bg-slate-800'}`}>
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    {selected && <Check className="size-4" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </section>
        </Dialog>
      )}

      {/* Mobile/Tablet Slide-over Drawer Cart Modal */}
      {isMobileCartOpen && (
        <Dialog label="Current bill" className="justify-end items-stretch lg:hidden" onClose={() => setIsMobileCartOpen(false)}>
          <div className="w-full max-w-md bg-[#131822] h-full shadow-2xl flex flex-col border-l border-slate-700">
            {renderCartContent(true)}
          </div>
        </Dialog>
      )}
      {customerPickerRevision !== null && (
        <CustomerSelectModal onSelect={customer => setCartCustomer(customer, customerPickerRevision)}
          onClose={() => setCustomerPickerRevision(null)} />
      )}
      {customItemRevision !== null && (
        <CustomItemDialog onAdd={(name, price) => addCustomCartItem(name, price, customItemRevision)}
          onClose={() => setCustomItemRevision(null)} />
      )}
      {discountEditorRevision !== null && (
        <DiscountDialog percent={discountPercent} hasDiscount={hasDiscount}
          onApply={value => setCartDiscount(value, discountEditorRevision)}
          onClose={() => setDiscountEditorRevision(null)} />
      )}
    </div>
  );
}
