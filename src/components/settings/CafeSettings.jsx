import React, { useId, useState } from 'react';
import { Building2, Printer, QrCode, Save, RotateCcw, Volume2, Percent, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isUpiQrImage } from '../../domain/upi';
import { sanitizeText } from '../../domain/sanitize';
import ToggleSwitch from '../layout/ToggleSwitch';

const field = 'min-h-11 w-full min-w-0 rounded-xl border border-[#263143] bg-[#121620] px-3 py-2 text-base text-white sm:text-sm';
const acceptedQrTypes = ['image/png', 'image/jpeg', 'image/webp'];

async function prepareQrImage(file) {
  if (!acceptedQrTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error('Choose a PNG, JPG or WebP image up to 10 MB.');
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const png = canvas.toDataURL('image/png');
    const saved = isUpiQrImage(png) ? png : canvas.toDataURL('image/jpeg', 0.95);
    if (isUpiQrImage(saved)) return saved;
  } finally {
    URL.revokeObjectURL(url);
  }
  throw new Error('Choose a smaller QR image.');
}

function PreferenceRow({ icon: Icon, title, description, checked, onChange, disabled }) {
  const descriptionId = useId();
  return (
    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-3 hover:bg-slate-800/50 has-[:disabled]:cursor-default sm:gap-3 sm:px-4">
      <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300 min-[360px]:grid">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span id={descriptionId} className="mt-0.5 block text-xs leading-relaxed text-slate-400">{description}</span>
      </span>
      <ToggleSwitch label={title} descriptionId={descriptionId} checked={checked} onChange={onChange} disabled={disabled} />
    </label>
  );
}

export default function CafeSettings() {
  const { settings, setSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [changes, setChanges] = useState({});
  const [busy, setBusy] = useState(false);
  const [preparingQr, setPreparingQr] = useState(false);
  const [qrError, setQrError] = useState('');
  const formData = { ...settings, ...changes };
  const qrPreview = isUpiQrImage(formData.upiQrImage) ? formData.upiQrImage : '';

  const tabs = [
    { id: 'profile', label: 'Business Profile', shortLabel: 'Business', icon: Building2 },
    { id: 'printer', label: 'Invoice & Printer', shortLabel: 'Invoices', icon: Printer },
    { id: 'upi', label: 'UPI & Payments', shortLabel: 'UPI', icon: QrCode }
  ];

  const handleChange = (field, value) => {
    setChanges(prev => ({ ...prev, [field]: value }));
  };

  async function handleQrUpload(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    setPreparingQr(true);
    setQrError('');
    try {
      handleChange('upiQrImage', await prepareQrImage(file));
    } catch (error) {
      setQrError(error instanceof DOMException ? 'Could not open this image. Choose another QR image.' : error.message);
    } finally {
      setPreparingQr(false);
    }
  }

  async function handleSave(event) {
    event?.preventDefault();
    if (busy || preparingQr || !Object.keys(changes).length) return;
    if (!formData.brandName.trim() || !formData.invoicePrefix.trim() ||
        !Number.isSafeInteger(formData.startingNumber) || formData.startingNumber <= 0) {
      showToast('Enter a business name, invoice prefix, and positive starting number.', 'error');
      return;
    }
    if (formData.upiVpaId && !/^[a-z0-9._-]+@[a-z0-9.-]+$/i.test(formData.upiVpaId.trim())) {
      showToast('Enter a valid UPI recipient or leave the field blank.', 'error');
      return;
    }
    setBusy(true);
    try {
      const sanitizedChanges = { ...changes };
      const textFields = ['brandName', 'ownerName', 'phone', 'email', 'streetAddress', 'city', 'state', 'pincode', 'invoicePrefix', 'fssaiLicense', 'gstinNumber', 'upiVpaId', 'payeeName', 'invoiceFooter'];
      for (const key of textFields) {
        if (typeof sanitizedChanges[key] === 'string') {
          sanitizedChanges[key] = sanitizeText(sanitizedChanges[key], key === 'streetAddress' || key === 'invoiceFooter' ? 300 : 100);
        }
      }
      if (await setSettings(sanitizedChanges)) setChanges({});
    } catch (error) {
      showToast(error.message || 'Could not save settings.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-4 app-gutters py-4 sm:space-y-6 sm:py-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-white">Cafe Settings</h1>
        </div>

        <button
          onClick={handleSave} type="button" disabled={busy || preparingQr || !Object.keys(changes).length} aria-label="Save all settings"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-orange-700 px-3 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden="true" />
          <span>{busy ? 'Saving…' : 'Save settings'}</span>
        </button>
      </div>

      {/* Settings Sub-tabs Navigation */}
      <div role="group" aria-label="Settings sections" className="grid grid-cols-3 gap-1 rounded-2xl border border-[#232b3a] bg-[#141923] p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id} type="button"
              onClick={() => setActiveTab(tab.id)} aria-pressed={isActive} aria-label={tab.label}
              className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center text-xs font-semibold transition-colors sm:flex-row sm:gap-2 sm:px-2 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a212e]'
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Body Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        {activeTab === 'profile' && (
          <div className="bg-[#171c26] p-4 sm:p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Cafe identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm [&>div]:min-w-0">
              <div>
                <label className="text-slate-400 block mb-1">Cafe / Brand Name *</label>
                <input aria-label="Cafe / Brand Name"
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  required
                  className={`${field} font-semibold`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Owner Full Name *</label>
                <input aria-label="Owner Full Name"
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  required
                  className={`${field} font-semibold`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mobile Phone *</label>
                <input aria-label="Mobile Phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className={`${field} font-mono`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input aria-label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${field} font-mono`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Street Address</label>
                <input aria-label="Street Address"
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  className={field}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">City</label>
                <input aria-label="City"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={field}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">State</label>
                <input aria-label="State"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={field}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Pincode</label>
                <input aria-label="Pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className={`${field} font-mono`}
                />
              </div>
            </div>

            <section aria-labelledby="pos-preferences" className="space-y-3 border-t border-[#232a39] pt-4">
              <h3 id="pos-preferences" className="text-sm font-bold text-white">POS preferences</h3>
              <div className="divide-y divide-[#232b3a] rounded-xl border border-[#232b3a] bg-[#121620]">
                <PreferenceRow icon={RotateCcw} title="Staff refunds"
                  description="Let staff record full refunds after returning the payment."
                  checked={Boolean(formData.allowStaffRefunds)} disabled={busy}
                  onChange={value => handleChange('allowStaffRefunds', value)} />
                <PreferenceRow icon={Volume2} title="POS sounds"
                  description="Play sounds when adding items and completing checkout."
                  checked={(formData.audioBeepsEnabled ?? formData.audioEnabled) !== false} disabled={busy}
                  onChange={value => handleChange('audioBeepsEnabled', value)} />
                <PreferenceRow icon={Percent} title="Cashier discounts"
                  description="Let cashiers apply preset percentage discounts to bills."
                  checked={Boolean(formData.allowCashierDiscounts)} disabled={busy}
                  onChange={value => handleChange('allowCashierDiscounts', value)} />
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Invoice Format & Thermal Printer Settings (Page 37) */}
        {activeTab === 'printer' && (
          <div className="bg-[#171c26] p-4 sm:p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              Invoice Format & Thermal Print Settings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm [&>div]:min-w-0">
              <div>
                <label className="text-slate-400 block mb-1">Invoice Prefix</label>
                <input aria-label="Invoice Prefix"
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className={`${field} font-mono font-bold`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Starting Number</label>
                <input aria-label="Starting Number"
                  type="number"
                  min="1" step="1" value={formData.startingNumber}
                  onChange={(e) => handleChange('startingNumber', Number(e.target.value))}
                  className={`${field} font-mono`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Default Thermal Size</label>
                <select aria-label="Default Thermal Size"
                  value={formData.defaultThermalSize}
                  onChange={(e) => handleChange('defaultThermalSize', e.target.value)}
                  className={field}
                >
                  <option value="80mm Standard POS Thermal">80mm Standard POS Thermal</option>
                  <option value="58mm Standard POS Thermal">58mm Standard POS Thermal</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="text-slate-400 block mb-1">Receipt Footer Message</label>
                <input aria-label="Receipt Footer Message"
                  type="text"
                  value={formData.receiptFooterMessage}
                  onChange={(e) => handleChange('receiptFooterMessage', e.target.value)}
                  className={field}
                />
              </div>

              <div className="lg:col-span-3">
                <label className="text-slate-400 block mb-1">Terms & Conditions</label>
                <textarea aria-label="Terms & Conditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                  rows={2}
                  className={field}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upi' && (
          <div className="bg-[#171c26] p-4 sm:p-6 rounded-2xl border border-[#232a39] space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#232b3a] pb-3">
              UPI payments
            </h2>

            <div className="space-y-3 rounded-xl border border-[#263143] bg-[#121620] p-3.5 sm:p-4">
              <div className="flex items-start gap-3">
                {qrPreview ? (
                  <img src={qrPreview} alt="Uploaded UPI QR preview" className="size-20 shrink-0 rounded-lg bg-white object-contain p-1" />
                ) : (
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
                    <QrCode className="size-5" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-white">Payment QR image</h3>
                  <p id="upi-qr-help" className="text-xs leading-relaxed text-slate-400">
                    Upload your reusable UPI QR. Checkout will display it and ask the customer to enter the amount.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-orange-500/35 bg-orange-500/10 px-3 text-sm font-semibold text-orange-200 hover:bg-orange-500/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-orange-400 has-[:disabled]:cursor-default has-[:disabled]:opacity-50">
                  <Upload className="size-4" aria-hidden="true" />
                  {preparingQr ? 'Preparing image…' : qrPreview ? 'Replace QR' : 'Upload QR'}
                  <input type="file" className="sr-only" accept={acceptedQrTypes.join(',')}
                    disabled={busy || preparingQr} aria-describedby="upi-qr-help" onChange={handleQrUpload} />
                </label>
                {qrPreview && (
                  <button type="button" className="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    disabled={busy || preparingQr} onClick={() => { handleChange('upiQrImage', ''); setQrError(''); }}>
                    Remove QR
                  </button>
                )}
              </div>
              {qrError && <p role="alert" className="text-sm text-rose-300">{qrError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm [&>div]:min-w-0">
              <div>
                <label htmlFor="settings-upi-id" className="text-slate-400 block mb-1">Cafe UPI ID</label>
                <input id="settings-upi-id"
                  type="text"
                  value={formData.upiVpaId}
                  onChange={(e) => handleChange('upiVpaId', e.target.value)}
                  placeholder="Enter UPI ID"
                  className={`${field} font-mono`}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Payee Name</label>
                <input aria-label="Payee Name"
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) => handleChange('payeeName', e.target.value)}
                  className={field}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              A UPI ID generates a QR with the bill amount when no image is uploaded.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
