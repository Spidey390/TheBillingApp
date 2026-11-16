import React, { useState, useMemo } from 'react';
import { Plus, Edit, X, Utensils, Check, Trash2, Circle, Sprout, ChevronDown, BookmarkPlus, Ruler, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import Select from '../layout/Select';
import FilterToolbar from '../layout/FilterToolbar';
import ToggleSwitch from '../layout/ToggleSwitch';
import { newId } from '../../domain/ids';
import { sanitizeText } from '../../domain/sanitize';
import { addonKey, addonNameKey, mergeSavedAddons } from '../../domain/addons';
import { categoryKey } from '../../domain/categories';

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
  const {
    products, saveProduct, deleteProduct, clearAllProducts, categories, settings, showToast,
    deleteSavedCategory, saveSavedCategory, deleteSavedAddon, saveSavedAddon
  } = useApp();

  const [activeCategory, setActiveCategory] = useState(allCategories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Manage Library Modal State (Categories & Add-ons)
  const [showManageLibrary, setShowManageLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState('categories');
  const [newCatInput, setNewCatInput] = useState('');
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  // Form State for Create/Edit Modal
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
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

  const handleDeleteCategory = async (catToDelete) => {
    const count = products.filter(p => categoryKey(p.category) === categoryKey(catToDelete)).length;
    const confirmMsg = count > 0
      ? `Delete category "${catToDelete}"? ${count} product${count > 1 ? 's' : ''} currently belong to this category and will become uncategorized.`
      : `Delete category "${catToDelete}"?`;
    if (window.confirm(confirmMsg)) {
      await deleteSavedCategory(catToDelete);
      if (formCategory === catToDelete) {
        setFormCategory('');
        if (categories.length <= 1) {
          setIsNewCategory(true);
          setNewCategoryName('');
        }
      }
      if (activeCategory === catToDelete) {
        setActiveCategory(allCategories);
      }
    }
  };

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
    let uncategorizedCount = 0;
    for (const product of products) {
      if (product.category) {
        counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
      } else {
        uncategorizedCount++;
      }
    }
    const list = [
      { value: allCategories, count: products.length },
      ...categories.map(category => ({ value: category, count: counts.get(category) ?? 0 }))
    ];
    if (uncategorizedCount > 0) {
      list.push({ value: 'Uncategorized', count: uncategorizedCount });
    }
    return list;
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === allCategories ||
        (activeCategory === 'Uncategorized' ? !p.category : p.category === activeCategory);
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(search));
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    const defaultCat = categories[0] || '';
    setFormCategory(defaultCat);
    setIsNewCategory(!defaultCat);
    setNewCategoryName('');
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
    setFormCategory(p.category || '');
    setIsNewCategory(false);
    setNewCategoryName('');
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

  const handleDeleteAll = async () => {
    if (!products.length || isSaving) return;
    if (!window.confirm(`Are you sure you want to remove ALL ${products.length} menu products? This action cannot be undone.`)) return;
    setIsSaving(true);
    try {
      await clearAllProducts();
    } finally {
      setIsSaving(false);
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
    const cleanCategory = sanitizeText(isNewCategory || !categories.length ? newCategoryName : formCategory, 50);
    if (!cleanName || !cleanCategory || !formSellingPrice || !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(costPrice) || costPrice < 0 || !validOptions(sizes) || !validOptions(options) ||
        (hasSizes && !sizes.length)) {
      showToast('Enter valid product details, a category, prices, and options.', 'error');
      return;
    }

    const id = editingProduct?.id || `prod-${newId()}`;
    const cleanSizes = sizes.map(s => ({ ...s, name: sanitizeText(s.name, 40) }));
    const cleanOptions = options.map(o => ({ ...o, name: sanitizeText(o.name, 40) }));
    setIsSaving(true);
    try {
      if (await saveProduct({
        id, name: cleanName, sku: cleanSku || id.toUpperCase(), barcode: cleanBarcode,
        category: cleanCategory, price, costPrice, dietary: formDietary, hasSizes, sizes: cleanSizes,
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
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowManageLibrary(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181e2b] hover:bg-[#202738] border border-[#263143] text-slate-200 font-bold text-xs transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <span>Manage Categories & Add-ons</span>
          </button>
          {products.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 font-bold text-xs transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove All ({products.length})</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>
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

                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 block text-xs font-semibold">Category *</label>
                      {categories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewCategory(prev => !prev);
                            if (!isNewCategory) setNewCategoryName('');
                          }}
                          className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                        >
                          {isNewCategory ? 'Choose saved' : '+ New category'}
                        </button>
                      )}
                    </div>

                    {isNewCategory || categories.length === 0 ? (
                      <div>
                        <input
                          aria-label="New Category"
                          type="text"
                          maxLength={50}
                          value={newCategoryName}
                          onChange={e => {
                            setNewCategoryName(e.target.value);
                            setFormCategory(e.target.value);
                          }}
                          placeholder={categories.length === 0 ? "e.g. Coffee, Pizza, Bakery..." : "Enter category name"}
                          required
                          className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 text-sm h-11"
                        />
                        {categories.length === 0 && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            No categories yet. Enter a category to create your first one.
                          </p>
                        )}
                      </div>
                    ) : (
                      <Select
                        label="Category"
                        value={formCategory}
                        onChange={val => {
                          if (val === '__new__') {
                            setIsNewCategory(true);
                            setNewCategoryName('');
                            setFormCategory('');
                          } else {
                            setFormCategory(val);
                          }
                        }}
                        onDeleteOption={handleDeleteCategory}
                        options={[
                          ...categories.map(c => ({ value: c, label: c })),
                          { value: '__new__', label: '+ Add new category…' }
                        ]}
                      />
                    )}
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
                        <div className="mt-1 max-h-44 min-w-48 overflow-y-auto rounded-lg border border-slate-700 bg-[#181e2b] p-1 space-y-0.5">
                          {availableAddons.map(addon => (
                            <div key={addonKey(addon)} className="flex items-center justify-between gap-1 rounded px-2 py-1 text-left text-xs text-slate-200 hover:bg-slate-700/50 group/savedAddon">
                              <button
                                type="button"
                                onClick={event => {
                                  const details = event.currentTarget.closest('details');
                                  if (details) details.open = false;
                                  addAddon(addon);
                                }}
                                className="flex flex-1 items-center justify-between gap-2 min-w-0 py-0.5"
                              >
                                <span className="min-w-0 truncate">{addon.name}</span>
                                <span className="shrink-0 text-orange-200">₹{Number(addon.price).toFixed(2)}</span>
                              </button>
                              <button
                                type="button"
                                title={`Delete saved add-on "${addon.name}"`}
                                aria-label={`Delete saved add-on ${addon.name}`}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete saved add-on "${addon.name}"?`)) {
                                    await deleteSavedAddon(addon.name);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 opacity-70 group-hover/savedAddon:opacity-100 transition-all shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
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

      {showManageLibrary && (
        <Dialog
          isOpen={showManageLibrary}
          onClose={() => setShowManageLibrary(false)}
          title="Manage Categories & Add-ons"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-[#263143]">
              <button
                type="button"
                onClick={() => setLibraryTab('categories')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  libraryTab === 'categories'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Categories ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setLibraryTab('addons')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  libraryTab === 'addons'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Saved Add-ons ({(settings.commonAddons || []).length})
              </button>
            </div>

            {/* Content for Categories */}
            {libraryTab === 'categories' && (
              <div className="space-y-4">
                {/* Add Category Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const trimmed = newCatInput.trim();
                    if (!trimmed) return;
                    await saveSavedCategory(trimmed);
                    setNewCatInput('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="New category name…"
                    value={newCatInput}
                    onChange={e => setNewCatInput(e.target.value)}
                    className="flex-1 bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] text-sm focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Add Category
                  </button>
                </form>

                {/* Categories List */}
                <div className="max-h-64 overflow-y-auto rounded-xl border border-[#263143] bg-[#121620] divide-y divide-[#1e2636]">
                  {categories.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No saved categories yet. Create your first category above!
                    </div>
                  ) : (
                    categories.map(cat => {
                      const count = products.filter(p => categoryKey(p.category) === categoryKey(cat)).length;
                      return (
                        <div key={cat} className="flex items-center justify-between p-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-white truncate">{cat}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                              {count} {count === 1 ? 'product' : 'products'}
                            </span>
                          </div>
                          <button
                            type="button"
                            title={`Delete category "${cat}"`}
                            onClick={async () => {
                              const confirmMsg = count > 0
                                ? `Delete category "${cat}"? ${count} product${count > 1 ? 's' : ''} currently belong to this category and will become uncategorized.`
                                : `Delete category "${cat}"?`;
                              if (window.confirm(confirmMsg)) {
                                await deleteSavedCategory(cat);
                                if (activeCategory === cat) setActiveCategory(allCategories);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Content for Addons */}
            {libraryTab === 'addons' && (
              <div className="space-y-4">
                {/* Add Addon Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const trimmed = newAddonName.trim();
                    const price = parseFloat(newAddonPrice);
                    if (!trimmed || !Number.isFinite(price) || price < 0) return;
                    await saveSavedAddon({ name: trimmed, price });
                    setNewAddonName('');
                    setNewAddonPrice('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="Add-on name…"
                    value={newAddonName}
                    onChange={e => setNewAddonName(e.target.value)}
                    className="flex-1 bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] text-sm focus:outline-none focus:border-orange-500"
                  />
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={newAddonPrice}
                      onChange={e => setNewAddonPrice(e.target.value)}
                      className="w-full bg-[#121620] text-white pl-6 pr-3 py-2 rounded-xl border border-[#263143] text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Add Add-on
                  </button>
                </form>

                {/* Addons List */}
                <div className="max-h-64 overflow-y-auto rounded-xl border border-[#263143] bg-[#121620] divide-y divide-[#1e2636]">
                  {(settings.commonAddons || []).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No saved add-ons yet. Create your first add-on above!
                    </div>
                  ) : (
                    (settings.commonAddons || []).map(addon => {
                      const count = products.filter(p => p.addons?.some(a => addonNameKey(a.name) === addonNameKey(addon.name))).length;
                      return (
                        <div key={addonKey(addon)} className="flex items-center justify-between p-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-white truncate">{addon.name}</span>
                            <span className="text-orange-400 font-bold shrink-0">₹{Number(addon.price).toFixed(2)}</span>
                            {count > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                                {count} {count === 1 ? 'product' : 'products'}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            title={`Delete saved add-on "${addon.name}"`}
                            onClick={async () => {
                              const confirmMsg = count > 0
                                ? `Delete saved add-on "${addon.name}"? It will also be removed from ${count} product${count > 1 ? 's' : ''}.`
                                : `Delete saved add-on "${addon.name}"?`;
                              if (window.confirm(confirmMsg)) {
                                await deleteSavedAddon(addon.name);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
