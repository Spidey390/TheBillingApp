import React, { useState } from 'react';
import { Plus, Truck, Receipt, Building2, Phone, Mail, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SuppliersPurchases() {
  const { suppliers, setSuppliers, purchases, setPurchases, rawMaterials, setRawMaterials, setAuditLogs, showToast, settings } = useApp();

  const [activeTab, setActiveTab] = useState('inward'); // 'inward', 'suppliers'
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // New Purchase Form
  const [purInvoiceNo, setPurInvoiceNo] = useState(`INV-${Date.now().toString().slice(-4)}`);
  const [purSupplierId, setPurSupplierId] = useState(suppliers[0]?.id || '');
  const [purItemsDesc, setPurItemsDesc] = useState('');
  const [purSubtotal, setPurSubtotal] = useState('5000');
  const [purPaymentMethod, setPurPaymentMethod] = useState('BANK_TRANSFER');

  // New Supplier Form
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supGstin, setSupGstin] = useState('');

  const handleRecordPurchase = (e) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === purSupplierId) || suppliers[0];
    const sub = parseFloat(purSubtotal) || 0;
    const tax = Number((sub * 0.05).toFixed(2));
    const total = sub + tax;

    const newPur = {
      id: 'pur-' + Date.now(),
      invoiceNo: purInvoiceNo,
      purchaseDate: new Date().toISOString().slice(0, 10),
      supplierId: sup.id,
      supplierName: sup.name,
      contactPerson: sup.contactPerson,
      itemsReceived: purItemsDesc || 'Inventory Batch Purchase',
      subtotal: sub,
      tax,
      totalAmount: total,
      paymentMethod: purPaymentMethod
    };

    setPurchases([newPur, ...purchases]);
    setSuppliers(suppliers.map(s => s.id === sup.id ? { ...s, totalSpend: s.totalSpend + total } : s));
    setShowPurchaseModal(false);
    showToast(`Recorded inward purchase ${purInvoiceNo}`);
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!supName.trim()) return;
    const newSup = {
      id: 'sup-' + Date.now(),
      name: supName.trim(),
      contactPerson: supContact.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim(),
      gstin: supGstin.trim() || '29AAAAA0000A1Z5',
      totalSpend: 0,
      balance: 0
    };
    setSuppliers([...suppliers, newSup]);
    setShowSupplierModal(false);
    setSupName('');
    showToast(`Added supplier ${newSup.name}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Suppliers & Purchase Inward</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Record supplier raw material & inventory batches to auto-increase cafe stock.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1b2230] hover:bg-[#252f42] text-slate-200 border border-[#2b3548] text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Add Supplier</span>
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Inward Purchase</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#141923] p-3 rounded-2xl border border-[#232b3a] flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('inward')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'inward'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-[#1a212e] text-slate-400 hover:text-white border border-[#283244]'
          }`}
        >
          Purchase Invoices Inward ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'suppliers'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-[#1a212e] text-slate-400 hover:text-white border border-[#283244]'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
      </div>

      {/* Tab 1: Inward Table (Page 31) */}
      {activeTab === 'inward' && (
        <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items Received</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax (₹)</th>
                  <th className="py-3 px-4">Total Amount (₹)</th>
                  <th className="py-3 px-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[#18202d] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{p.invoiceNo}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.purchaseDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{p.supplierName}</div>
                      <div className="text-[10px] text-slate-500">{p.contactPerson}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{p.itemsReceived}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">₹{p.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">₹{p.tax.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{p.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Total Procurement Spend</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#18202d] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-slate-300">{s.contactPerson}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.phone}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{s.gstin}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹{s.totalSpend.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-right">₹{s.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Inward Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Record Inward Stock Purchase</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPurchase} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={purInvoiceNo}
                    onChange={(e) => setPurInvoiceNo(e.target.value)}
                    required
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Supplier</label>
                  <select
                    value={purSupplierId}
                    onChange={(e) => setPurSupplierId(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Items Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10 KG Arabica Coffee Beans, 30L Milk"
                  value={purItemsDesc}
                  onChange={(e) => setPurItemsDesc(e.target.value)}
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Subtotal (₹)</label>
                  <input
                    type="number"
                    value={purSubtotal}
                    onChange={(e) => setPurSubtotal(e.target.value)}
                    required
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={purPaymentMethod}
                    onChange={(e) => setPurPaymentMethod(e.target.value)}
                    className="w-full bg-[#121620] text-white px-2.5 py-1.5 rounded-xl border border-[#263143]"
                  >
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Save Inward Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232b3a]">
              <h3 className="text-sm font-bold text-white">Add New Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Blue Tokai Coffee Wholesale"
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="e.g. +91 98450 11223"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">GSTIN</label>
                <input
                  type="text"
                  value={supGstin}
                  onChange={(e) => setSupGstin(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#232b3a]">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Create Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
