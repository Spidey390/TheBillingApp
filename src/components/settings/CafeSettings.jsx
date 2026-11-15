import React, { useState } from 'react';
import { 
  Building2, 
  Printer, 
  QrCode, 
  Cpu, 
  Database, 
  Save, 
  Download, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CafeSettings() {
  const { 
    settings, 
    setSettings, 
    resetDemoData, 
    exportDatabase, 
    importDatabase,
    showToast,
    triggerAudio 
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'printer', 'upi', 'bom', 'backup'
  const [formData, setFormData] = useState({ ...settings });

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'printer', label: 'Invoice & Printer', icon: Printer },
    { id: 'upi', label: 'UPI & Payments', icon: QrCode },
    { id: 'bom', label: 'POS & Recipe BOM', icon: Cpu },
    { id: 'backup', label: 'Data Backup & Reset', icon: Database },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    setSettings(formData);
    triggerAudio('beep');
    showToast('Cafe settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Cafe Settings & Configuration</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize GST billing details, thermal print templates, UPI QR payee, and backups.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Settings Sub-tabs Navigation */}
      <div className="bg-[#141923] p-1.5 rounded-2xl border border-[#232b3a] flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a212e]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Body Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Business Profile & GST Registration (Page 36) */}
        {activeTab === 'profile' && (
          <div className="bg-[#171c26] p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Cafe Identity & GST Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Cafe / Brand Name *</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Business Registration</label>
                <select
                  value={formData.businessRegistration}
                  onChange={(e) => handleChange('businessRegistration', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                >
                  <option value="GST Registered Business">GST Registered Business</option>
                  <option value="Composition Scheme">Composition Scheme (F&B)</option>
                  <option value="Unregistered / Prop">Unregistered / Prop</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">GSTIN Number (15-digit)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Invoice Format & Thermal Printer Settings (Page 37) */}
        {activeTab === 'printer' && (
          <div className="bg-[#171c26] p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Invoice Format & Thermal Print Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Starting Number</label>
                <input
                  type="number"
                  value={formData.startingNumber}
                  onChange={(e) => handleChange('startingNumber', Number(e.target.value))}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Default Thermal Size</label>
                <select
                  value={formData.defaultThermalSize}
                  onChange={(e) => handleChange('defaultThermalSize', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                >
                  <option value="80mm Standard POS Thermal">80mm Standard POS Thermal</option>
                  <option value="58mm Standard POS Thermal">58mm Standard POS Thermal</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-slate-400 block mb-1">Receipt Footer Message</label>
                <input
                  type="text"
                  value={formData.receiptFooterMessage}
                  onChange={(e) => handleChange('receiptFooterMessage', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-slate-400 block mb-1">Terms & Conditions</label>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                  rows={2}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dynamic UPI QR & Payment Gateway (Page 38) */}
        {activeTab === 'upi' && (
          <div className="bg-[#171c26] p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Dynamic UPI QR Code & Payment Setup
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Cafe UPI VPA ID *</label>
                <input
                  type="text"
                  value={formData.upiVpaId}
                  onChange={(e) => handleChange('upiVpaId', e.target.value)}
                  required
                  placeholder="e.g. brewandbite@upi"
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Payee Name</label>
                <input
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) => handleChange('payeeName', e.target.value)}
                  className="w-full bg-[#121620] text-white px-3 py-2 rounded-xl border border-[#263143] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Customer will scan QR to pay directly into your cafe bank account with zero fees.
            </p>
          </div>
        )}

        {/* Tab 4: POS & Recipe BOM Automation Rules (Page 39) */}
        {activeTab === 'bom' && (
          <div className="bg-[#171c26] p-6 rounded-2xl border border-[#232a39] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Operational Automation Rules
            </h2>

            <div className="space-y-3">
              {/* Checkbox 1 */}
              <label className="flex items-start justify-between p-4 rounded-xl bg-[#121620] border border-[#232b3a] cursor-pointer hover:border-[#333e54] transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-white">
                    Automatic Raw Material Recipe (BOM) Stock Deduction
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Deduct coffee beans, milk, sugar, burger buns, cheese, etc. automatically when items are billed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoBOMDeduction}
                  onChange={(e) => handleChange('autoBOMDeduction', e.target.checked)}
                  className="w-5 h-5 rounded border-[#38465d] bg-[#1a212e] text-orange-500 focus:ring-0 mt-0.5"
                />
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start justify-between p-4 rounded-xl bg-[#121620] border border-[#232b3a] cursor-pointer hover:border-[#333e54] transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-white">
                    POS Audio Beep & Chime Sound Effects
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Play audio beeps when clicking menu items and pleasant checkout success chime.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.audioBeepsEnabled}
                  onChange={(e) => handleChange('audioBeepsEnabled', e.target.checked)}
                  className="w-5 h-5 rounded border-[#38465d] bg-[#1a212e] text-orange-500 focus:ring-0 mt-0.5"
                />
              </label>

              {/* Checkbox 3 */}
              <label className="flex items-start justify-between p-4 rounded-xl bg-[#121620] border border-[#232b3a] cursor-pointer hover:border-[#333e54] transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-white">
                    Allow Cashiers to Apply Custom Discounts
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Enables counter staff to give percentage or flat rupee discounts on bills.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowCashierDiscounts}
                  onChange={(e) => handleChange('allowCashierDiscounts', e.target.checked)}
                  className="w-5 h-5 rounded border-[#38465d] bg-[#1a212e] text-orange-500 focus:ring-0 mt-0.5"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 5: Database Backup (JSON Export) & Demo Reset (Page 40) */}
        {activeTab === 'backup' && (
          <div className="bg-[#171c26] p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Database Engine & Offline Storage Management
            </h2>

            {/* Active Database Architecture Card */}
            <div className="p-4 rounded-xl bg-[#121620] border border-[#232b3a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">IndexedDB (Dexie.js v4) - Production Database</h3>
                    <p className="text-[11px] text-cyan-300/80">100% Offline-First • ACID Transactional Engine</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE & PERSISTENT
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] text-slate-400 border-t border-[#1e2636]">
                <div>
                  <span className="block text-slate-500 text-[10px]">TRANSACTION SAFETY</span>
                  <span className="font-semibold text-slate-200">ACID Atomic Rollback</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">STORAGE QUOTA</span>
                  <span className="font-semibold text-slate-200">Persistent (Up to 60% Disk)</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">CLOUD EXPENSE</span>
                  <span className="font-semibold text-emerald-400">₹0/mo Lifetime Free</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Export Full Database Backup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#121620] border border-[#232b3a]">
                <div>
                  <h3 className="text-xs font-bold text-white">Export Full Database Backup</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Downloads all orders, master menu, recipe BOMs, customers, purchases, expenses and settings as a standalone JSON backup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportDatabase}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Import Database Backup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#121620] border border-[#232b3a]">
                <div>
                  <h3 className="text-xs font-bold text-white">Restore Database From Backup</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a previously exported JSON backup file to restore into your local IndexedDB.
                  </p>
                </div>
                <label className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1e2636] hover:bg-[#283348] text-slate-200 font-bold text-xs border border-[#2e3b52] cursor-pointer transition-colors shrink-0">
                  <Database className="w-4 h-4 text-orange-400" />
                  <span>Choose Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result;
                          if (content && typeof content === 'string') {
                            if (confirm('Restoring this backup will replace current records. Proceed?')) {
                              importDatabase(content);
                            }
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Reset Database to Clean Production */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
                <div>
                  <h3 className="text-xs font-bold text-rose-300">Reset to Clean Production (Zero Mock Data)</h3>
                  <p className="text-[11px] text-rose-400/80 mt-0.5">
                    Resets database to clean state: clears all orders, customers, and expenses, while keeping protected cafe menu items.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset the database to clean production state (zero mock data)?')) {
                      resetDemoData();
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Database</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
