import React, { useState, useMemo } from 'react';
import { Plus, Edit, X, Utensils, Check, Trash2, Circle, Sprout, ChevronDown, BookmarkPlus, Ruler, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import FilterToolbar from '../layout/FilterToolbar';
import ToggleSwitch from '../layout/ToggleSwitch';
import { newId } from '../../domain/ids';
import { sanitizeText } from '../../domain/sanitize';
import { addonKey, addonNameKey, mergeSavedAddons } from '../../domain/addons';

const dietaryOptions = [
  { label: 'Pure Veg', Icon: Circle, color: 'text-emerald-400' },
  { label: 'Non-Veg', Icon: Circle, color: 'text-rose-400' },
  { label: 'Vegan', Icon: Sprout, color: 'text-lime-400' }
];

function ProductOptionSection({ title, icon: Icon, enabled, onChange, children }) {
  return (
    <section className={`rounded-xl border bg-[#121620] ${enabled ? 'border-orange-500/30' : 'border-slate-700/70'}`}>
      <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2.5 font-semibold text-slate-100">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {title}
        </span>
        <ToggleSwitch label={`Enable ${title.toLowerCase()}`} checked={enabled} onChange={onChange} />
      </label>
      {enabled && <div className="space-y-3 border-t border-slate-700/60 p-3">{children}</div>}
    </section>
  );
}

function OptionRows({ rows, kind, onChange, onRemove }) {
  return rows.map((row, index) => (
    <div key={row.id ?? index} className="grid grid-cols-[minmax(0,1fr)_minmax(3.75rem,5rem)_auto] items-center gap-2">
      <input value={row.name} onChange={event => onChange(index, { name: event.target.value })}
        aria-label={`${kind} name ${index + 1}`} placeholder={`${kind} name`}
        className="h-10 w-full min-w-0 rounded-lg border border-slate-700 bg-[#181e2b] px-2.5 text-white" />
      <input type="number" inputMode="decimal" min="0" step="0.01" value={row.price}
        onChange={event => onChange(index, { price: event.target.value })}
        aria-label={`${kind} price ${index + 1} in rupees`} placeholder="₹"
        className="h-10 w-full min-w-0 rounded-lg border border-slate-700 bg-[#181e2b] px-2 tabular-nums text-white
          [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
      <button type="button" aria-label={`Remove ${kind.toLowerCase()} ${index + 1}`} onClick={() => onRemove(index)}
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-rose-950 hover:text-rose-300">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  ));
}

const optionButton = 'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-orange-500/30 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10';
const allCategories = 'All Categories';

export default function MenuCatalog() {
  const { products, saveProduct, deleteProduct, categories, settings, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState(allCategories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State for Create/Edit Modal
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSku, setFormSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [formDietary, setFormDietary] = useState('Pure Veg');
  const [formSizes, setFormSizes] = useState([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [hasAddons, setHasAddons] = useState(false);
  const [formAddons, setFormAddons] = useState([]);
  const availableAddons = mergeSavedAddons(settings.commonAddons)
    .filter(addon => !formAddons.some(row => addonNameKey(row.name) === addonNameKey(addon.name)));

  function addAddon(template = { name: '', price: '' }) {
    setFormAddons(rows => [...rows, { ...template, id: newId() }]);
  }

  function updateAddon(index, changes) {
    setFormAddons(rows => rows.map((row, i) => i === index ? { ...row, ...changes } : row));
  }

  function closeEditor() {
    if (!isSaving) setShowModal(false);
  }

  const categoryOptions = useMemo(() => {
    const counts = new Map();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return [
      { value: allCategories, count: products.length },
      ...categories.map(category => ({ value: category, count: counts.get(category) ?? 0 }))
    ];
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === allCategories || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(search));
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]);
    setFormSellingPrice('');
    setFormCostPrice('');
    setFormSku('');
    setBarcode('');
    setFormDietary('Pure Veg');
    setHasSizes(false);
    setFormSizes([{ name: 'Regular', price: '' }]);
    setHasAddons(false);
    setFormAddons([]);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormSellingPrice(String(p.price));
    setFormCostPrice(String(p.costPrice ?? ''));
    setFormSku(p.sku || '');
    setBarcode(p.barcode || '');
    setFormDietary(p.dietary || 'Pure Veg');
    setHasSizes(!!p.hasSizes);
    setFormSizes(p.sizes || [{ name: 'Regular', price: p.price }]);
    setHasAddons(p.hasAddons ?? Boolean(p.addons?.length));
    setFormAddons(p.addons || []);
    setShowModal(true);
  };

  const handleDeleteDish = async () => {
    if (!editingProduct) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${editingProduct.name}" from the menu?`);
    if (confirmDelete && await deleteProduct(editingProduct.id)) {
      setShowModal(false);
    }
  };

  const handleSave = async event => {
    event.preventDefault();
    if (isSaving) return;
    const price = Number(formSellingPrice);
    const costPrice = Number(formCostPrice);
    const sizes = hasSizes ? formSizes.map(size => ({ name: size.name.trim(), price: Number(size.price) })) : [];
    const options = hasAddons ? formAddons.map(addon => ({ ...addon, name: addon.name.trim(), price: Number(addon.price) })) : [];
    const validOptions = rows => rows.every(row => row.name && Number.isFinite(row.price) && row.price >= 0) &&
      new Set(rows.map(row => row.name.toLowerCase())).size === rows.length;
    const cleanName = sanitizeText(formName, 100);
    const cleanSku = sanitizeText(formSku, 50);
    const cleanBarcode = sanitizeText(barcode, 50);
    if (!cleanName || !formSellingPrice || !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(costPrice) || costPrice < 0 || !validOptions(sizes) || !validOptions(options) ||
        (hasSizes && !sizes.length)) {
      showToast('Enter valid prices and give each size or add-on a distinct name.', 'error');
      return;
    }

    const id = editingProduct?.id || `prod-${newId()}`;
    const cleanSizes = sizes.map(s => ({ ...s, name: sanitizeText(s.name, 40) }));
    const cleanOptions = options.map(o => ({ ...o, name: sanitizeText(o.name, 40) }));
    setIsSaving(true);
    try {
      if (await saveProduct({
        id, name: cleanName, sku: cleanSku || id.toUpperCase(), barcode: cleanBarcode,
        category: formCategory, price, costPrice, dietary: formDietary, hasSizes, sizes: cleanSizes,
        hasAddons, addons: cleanOptions
      })) setShowModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-w-0 app-gutters py-4 sm:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="sr-only text-xl font-extrabold text-white xl:not-sr-only">Menu & Product Catalog</h1>
          <p className="mt-0.5 hidden text-xs text-slate-400 xl:block">
            Manage cafe items, pricing, sizes, and dietary tags.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      <FilterToolbar search={search} onSearch={setSearch} searchLabel="Search menu" placeholder="Search menu…"
        groups={[{
          name: 'category', label: 'Category', value: activeCategory, defaultValue: allCategories, options: categoryOptions
        }]}
        onApply={({ category }) => setActiveCategory(category)} />

      {/* Master Products Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        <div className="xl:overflow-x-auto">
          <table role="table" aria-label="Menu products" className="responsive-records menu-records w-full text-left text-xs border-collapse min-w-[760px]">
            <thead role="rowgroup">
              <tr role="row" className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th role="columnheader" scope="col" className="py-3 px-4">Product Details</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Category</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Selling Price</th>
                <th role="columnheader" scope="col" className="py-3 px-4">Cost Price</th>
                <th role="columnheader" scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="divide-y divide-[#1e2636]">
              {!filteredProducts.length && (
                <tr role="row"><td role="cell" colSpan={5} className="record-empty px-4 py-6 text-sm text-slate-300">
                  {search || activeCategory !== allCategories ? 'No products match these filters.' : 'No products yet.'}
                </td></tr>
              )}
              {filteredProducts.map((p) => {
                return (
                  <tr role="row" key={p.id} className="hover:bg-[#18202d] transition-colors group">
                    {/* Product Details */}
                    <td role="cell" className="py-3 px-4 record-title">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded bg-white/90 border ${
                            p.dietary === 'Non-Veg' ? 'border-rose-600' : 'border-emerald-600'
                          } hidden items-center justify-center p-0.5 shrink-0 xl:flex`}
                          title={p.dietary || 'Pure Veg'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.dietary === 'Non-Veg' ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          ></span>
                        </div>
                        <div>
                          <div className="font-medium text-white transition-colors xl:font-bold xl:group-hover:text-orange-300">
                            {p.name}
                          </div>
                          <div className="hidden text-[10px] text-slate-500 font-mono xl:block">
                            {p.sku} • Barcode: {p.barcode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td role="cell" className="py-3 px-4 menu-record-category"><span className="record-label" aria-hidden="true">Category</span>
                      <span className="text-slate-300 font-medium">{p.category}</span>
                    </td>

                    {/* Selling Price */}
                    <td role="cell" className="py-3 px-4 menu-record-price"><span className="record-label" aria-hidden="true">Selling price</span>
                      <div className="font-mono font-bold text-white text-sm">
                        ₹{p.price}
                      </div>
                      {p.hasSizes && (
                        <div className="hidden text-[10px] text-amber-400 font-medium xl:block">({p.sizes?.length} sizes)</div>
                      )}
                    </td>

                    {/* Cost Price */}
                    <td role="cell" className="py-3 px-4 font-mono text-slate-400 menu-record-desktop"><span className="record-label" aria-hidden="true">Cost price</span>
                      ₹{p.costPrice}
                    </td>

                    {/* Actions */}
                    <td role="cell" className="py-3 px-4 text-right record-actions">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Dish" aria-label={`Edit ${p.name}`}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#18202d] hover:bg-orange-500 text-slate-300 hover:text-white border border-[#283244] text-xs font-semibold transition-all group shadow-sm active:scale-95"
                        >
                          <Edit className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                          <span className="hidden xl:inline">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal (Page 26) */}
      {showModal && (
        <Dialog label="Product editor" onClose={closeEditor} className="items-center justify-center overflow-hidden p-3 sm:p-4">
          <form onSubmit={handleSave} className="flex max-h-[min(92dvh,100%)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#171c26] shadow-2xl">
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 px-4 py-3 sm:px-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-300"><Utensils className="h-5 w-5" aria-hidden="true" /></div>
              <h3 className="min-w-0 flex-1 text-lg font-bold text-white">
                {editingProduct ? 'Edit product' : 'Add a product'}
              </h3>
              <button type="button" aria-label="Close product editor" disabled={isSaving} onClick={closeEditor}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
              <fieldset disabled={isSaving} className="min-w-0 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 [&>div]:min-w-0">
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">Product Name *</label>
                    <input aria-label="Product Name"
                      type="text"
                      maxLength={100}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter product name"
                      required
                      className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <label className="block text-slate-300">Barcode
                    <input type="text" maxLength={50} value={barcode} onChange={event => setBarcode(event.target.value)}
                      className="mt-1 w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143]" />
                  </label>

                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select aria-label="Category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">SKU / Item Code</label>
                    <input aria-label="SKU / Item Code"
                      type="text"
                      maxLength={50}
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Selling Price (₹) *</label>
                    <input aria-label="Selling Price (₹)"
                      type="number"
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(e.target.value)}
                      required
                      className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                    <input aria-label="Cost Price (₹)"
                      type="number"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                    />
                  </div>

                  <fieldset className="col-span-2 min-w-0">
                    <legend className="mb-1.5 text-slate-400">Dietary Type</legend>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map(({ label, Icon, color }) => (
                        <label key={label} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2
                          focus-within:outline focus-within:outline-2 focus-within:outline-orange-400 ${formDietary === label
                            ? 'border-orange-500/60 bg-orange-500/15 text-white'
                            : 'border-[#263143] bg-[#121620] text-slate-300 hover:border-slate-500'}`}>
                          <input type="radio" name="dietary-type" value={label} checked={formDietary === label}
                            onChange={() => setFormDietary(label)} className="sr-only" />
                          <Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 ${color}`}
                            fill={Icon === Circle ? 'currentColor' : 'none'} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <ProductOptionSection title="Sizes" icon={Ruler} enabled={hasSizes} onChange={setHasSizes}>
                  <OptionRows rows={formSizes} kind="Size"
                    onChange={(index, patch) => setFormSizes(rows => rows.map((row, i) => i === index ? { ...row, ...patch } : row))}
                    onRemove={index => setFormSizes(rows => rows.filter((_, i) => i !== index))} />
                  <button type="button" onClick={() => setFormSizes(rows => [...rows, { name: '', price: '' }])}
                    className={optionButton}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add size
                  </button>
                </ProductOptionSection>

                <ProductOptionSection title="Add-ons" icon={SlidersHorizontal} enabled={hasAddons} onChange={setHasAddons}>
                  <OptionRows rows={formAddons} kind="Add-on" onChange={updateAddon}
                    onRemove={index => setFormAddons(rows => rows.filter((_, i) => i !== index))} />
                  <div className="flex flex-wrap items-start gap-2">
                    <button type="button" onClick={() => addAddon()}
                      className={optionButton}>
                      <Plus className="h-4 w-4" aria-hidden="true" /> Add new add-on
                    </button>
                    {availableAddons.length > 0 && (
                      <details className="group min-w-0">
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 [&::-webkit-details-marker]:hidden">
                          <BookmarkPlus className="h-4 w-4" aria-hidden="true" /> Saved add-ons
                          <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="mt-1 max-h-40 min-w-44 overflow-y-auto rounded-lg border border-slate-700 bg-[#181e2b] p-1">
                          {availableAddons.map(addon => (
                            <button key={addonKey(addon)} type="button" onClick={event => {
                              const details = event.currentTarget.closest('details');
                              details.open = false;
                              details.querySelector('summary').focus();
                              addAddon(addon);
                            }} className="flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left text-xs text-slate-200 hover:bg-slate-700/50">
                              <span className="min-w-0 break-words">{addon.name}</span>
                              <span className="shrink-0 text-orange-200">₹{addon.price.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </ProductOptionSection>
              </fieldset>
            </div>
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-700/60 bg-slate-950/25 px-4 py-3 sm:px-5">
              {editingProduct && (
                <button type="button" disabled={isSaving} onClick={handleDeleteDish}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-950/60">
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button type="button" disabled={isSaving} onClick={closeEditor}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700/40">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-800 disabled:opacity-60">
                  {isSaving ? 'Saving…' : editingProduct ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </footer>
          </form>
        </Dialog>
      )}
    </div>
  );
}
