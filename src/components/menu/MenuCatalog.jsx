import React, { useState, useMemo } from 'react';
import { Plus, Search, Copy, Edit, Lock, X, Utensils, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MenuCatalog() {
  const { products, setProducts, categories, rawMaterials, addons = [], showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State for Create/Edit Modal
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDietary, setFormDietary] = useState('Pure Veg');
  const [formStock, setFormStock] = useState('50');
  const [formSizes, setFormSizes] = useState([
    { name: 'Regular', price: 120 },
    { name: 'Large', price: 160 }
  ]);
  const [hasSizes, setHasSizes] = useState(false);
  const [hasAddons, setHasAddons] = useState(false);
  const [formAddons, setFormAddons] = useState([]);
  const [selectedBOMs, setSelectedBOMs] = useState([]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All Categories' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(search));
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]);
    setFormSellingPrice('120');
    setFormCostPrice('35');
    setFormSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormDietary('Pure Veg');
    setFormStock('50');
    setHasSizes(false);
    setHasAddons(false);
    setFormAddons([]);
    setSelectedBOMs([]);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormSellingPrice(String(p.price));
    setFormCostPrice(String(p.costPrice || 35));
    setFormSku(p.sku);
    setFormDietary(p.dietary || 'Pure Veg');
    setFormStock(String(p.stock));
    setHasSizes(!!p.hasSizes);
    setFormSizes(p.sizes || [{ name: 'Regular', price: p.price }]);
    setHasAddons(!!(p.hasAddons || (p.addons && p.addons.length > 0)));
    setFormAddons(p.addons || []);
    setSelectedBOMs(p.bom || []);
    setShowModal(true);
  };

  const handleDuplicate = (p) => {
    const copy = {
      ...p,
      id: 'prod-' + Date.now(),
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-CPY`,
      barcode: String(Number(p.barcode || '8901000000') + 1)
    };
    setProducts([...products, copy]);
    showToast(`Duplicated ${p.name}`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formSellingPrice) return;

    const prodData = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      sku: formSku || `SKU-${Date.now()}`,
      barcode: editingProduct?.barcode || `890100${Math.floor(1000 + Math.random() * 9000)}`,
      category: formCategory,
      price: Number(formSellingPrice),
      costPrice: Number(formCostPrice) || 30,
      gstRate: 5,
      stock: Number(formStock) || 50,
      dietary: formDietary,
      image: editingProduct?.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
      hasSizes,
      sizes: hasSizes ? formSizes : [],
      hasAddons,
      addons: hasAddons ? formAddons : [],
      bom: selectedBOMs
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? prodData : p));
      showToast('Product updated');
    } else {
      setProducts([...products, prodData]);
      showToast('New product created');
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Menu & Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage cafe items, pricing, sizes/variants, GST rates, and recipe Bill of Materials (BOM).
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

      {/* Toolbar & Filters */}
      <div className="bg-[#141923] p-4 rounded-2xl border border-[#232b3a] space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('All Categories')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'All Categories'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-[#1b2230] text-slate-400 hover:text-slate-200 border border-[#293345]'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-[#1b2230] text-slate-400 hover:text-slate-200 border border-[#293345]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-[#293345] focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Master Products Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">GST Rate</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">BOM Recipes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2636]">
              {filteredProducts.map((p) => {
                const bomCount = p.bom?.length || 0;
                return (
                  <tr key={p.id} className="hover:bg-[#18202d] transition-colors group">
                    {/* Product Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#283244] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-300 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.sku} • Barcode: {p.barcode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{p.category}</span>
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm">
                        ₹{p.price}
                      </div>
                      {p.hasSizes && (
                        <div className="text-[10px] text-amber-400 font-medium">({p.sizes?.length} sizes)</div>
                      )}
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      ₹{p.costPrice}
                    </td>

                    {/* GST Rate */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {p.gstRate}%
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        {p.stock} Pieces
                      </span>
                    </td>

                    {/* BOM Recipes */}
                    <td className="py-3 px-4">
                      {bomCount > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {bomCount} ingredients linked
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">No BOM</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleDuplicate(p)}
                          title="Duplicate Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252f42] transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-[#252f42] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <span
                          title="Menu items are protected and cannot be deleted"
                          className="p-1.5 rounded-lg text-slate-600 cursor-not-allowed flex items-center justify-center"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Menu Product' : 'Create New Menu Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Classic Cappuccino"
                    required
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    required
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Dietary Type</label>
                  <select
                    value={formDietary}
                    onChange={(e) => setFormDietary(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                  >
                    <option value="Pure Veg">🟢 Pure Veg</option>
                    <option value="Non-Veg">🔴 Non-Veg</option>
                    <option value="Vegan">🌱 Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Sizes / Variants Accordion */}
              <div className="p-3 bg-[#121620] rounded-xl border border-[#232b3a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Product Sizes / Variants</span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSizes}
                      onChange={(e) => setHasSizes(e.target.checked)}
                      className="rounded border-[#344157] text-orange-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400">Enable Sizes</span>
                  </label>
                </div>

                {hasSizes && (
                  <div className="space-y-1.5 pt-2">
                    {formSizes.map((sz, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={sz.name}
                          onChange={(e) => {
                            const updated = [...formSizes];
                            updated[idx].name = e.target.value;
                            setFormSizes(updated);
                          }}
                          placeholder="Size Name"
                          className="flex-1 bg-[#181e2b] text-white px-2.5 py-1.5 rounded-lg border border-[#263143]"
                        />
                        <input
                          type="number"
                          value={sz.price}
                          onChange={(e) => {
                            const updated = [...formSizes];
                            updated[idx].price = Number(e.target.value);
                            setFormSizes(updated);
                          }}
                          placeholder="Price"
                          className="w-24 bg-[#181e2b] text-white px-2.5 py-1.5 rounded-lg border border-[#263143] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setFormSizes(formSizes.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormSizes([...formSizes, { name: 'Small', price: 90 }])}
                      className="text-[11px] text-orange-400 hover:underline font-bold"
                    >
                      + Add Size Variant
                    </button>
                  </div>
                )}
              </div>

              {/* Add-on Options / Customizations */}
              <div className="p-3 bg-[#121620] rounded-xl border border-[#232b3a] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-300 block text-xs">Product Add-ons & Extras</span>
                    <span className="text-[10px] text-slate-400">Extra cheese, dips, shots, toppings etc.</span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAddons}
                      onChange={(e) => setHasAddons(e.target.checked)}
                      className="rounded border-[#344157] text-orange-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400 font-semibold">Enable Add-ons</span>
                  </label>
                </div>

                {hasAddons && (
                  <div className="space-y-2 pt-2">
                    {formAddons.map((addon, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={addon.name}
                          onChange={(e) => {
                            const updated = [...formAddons];
                            updated[idx].name = e.target.value;
                            setFormAddons(updated);
                          }}
                          placeholder="e.g. Extra Cheese / Dip / Shot"
                          className="flex-1 bg-[#181e2b] text-white px-2.5 py-1.5 rounded-lg border border-[#263143] text-xs"
                        />
                        <div className="flex items-center space-x-1 w-24">
                          <span className="text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            value={addon.price}
                            onChange={(e) => {
                              const updated = [...formAddons];
                              updated[idx].price = Number(e.target.value);
                              setFormAddons(updated);
                            }}
                            placeholder="Price"
                            className="w-full bg-[#181e2b] text-white px-2 py-1.5 rounded-lg border border-[#263143] font-mono text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormAddons(formAddons.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormAddons([...formAddons, { id: 'add-' + Date.now(), name: 'Extra Topping', price: 30 }])}
                        className="text-[11px] text-orange-400 hover:underline font-bold"
                      >
                        + Add Custom Add-on
                      </button>

                      {addons?.length > 0 && (
                        <select
                          onChange={(e) => {
                            const found = addons.find(a => a.id === e.target.value);
                            if (found && !formAddons.some(a => a.name === found.name)) {
                              setFormAddons([...formAddons, { id: 'add-' + Date.now(), name: found.name, price: found.price }]);
                            }
                            e.target.value = '';
                          }}
                          className="bg-[#181e2b] text-[10px] text-slate-300 px-2 py-1 rounded border border-[#263143] ml-auto"
                          defaultValue=""
                        >
                          <option value="" disabled>+ Pick Common Add-on...</option>
                          {addons.map(a => (
                            <option key={a.id} value={a.id}>{a.name} (+₹{a.price})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Recipe / Bill of Materials (BOM) */}
              <div className="p-3 bg-[#121620] rounded-xl border border-[#232b3a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Recipe / Bill of Materials (BOM)</span>
                  <span className="text-[10px] text-slate-400">{selectedBOMs.length} ingredients</span>
                </div>

                <div className="space-y-1 pt-1">
                  {selectedBOMs.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#181e2b] text-[11px]">
                      <span>{b.name}</span>
                      <span className="font-mono text-orange-400">{b.qty} {b.unit}</span>
                    </div>
                  ))}

                  <div className="pt-2">
                    <select
                      onChange={(e) => {
                        const raw = rawMaterials.find(r => r.id === e.target.value);
                        if (raw && !selectedBOMs.some(b => b.rawId === raw.id)) {
                          setSelectedBOMs([...selectedBOMs, { rawId: raw.id, name: raw.name, qty: 0.05, unit: raw.unit }]);
                        }
                      }}
                      className="w-full bg-[#181e2b] text-[11px] text-slate-300 p-2 rounded-lg border border-[#263143]"
                    >
                      <option value="">+ Link Raw Ingredient...</option>
                      {rawMaterials.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.unit})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/25"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
