import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  IndianRupee, 
  QrCode, 
  CreditCard, 
  GitFork, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PaymentModal() {
  const { cartTotal, completePayment, closeModal, settings, triggerAudio } = useApp();

  const [paymentMode, setPaymentMode] = useState('UPI'); // UPI by default or Cash
  const [cashReceived, setCashReceived] = useState(Math.ceil(cartTotal)); // e.g. 531 if 530.25
  const [referenceNo, setReferenceNo] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Split mode state
  const [splitCash, setSplitCash] = useState(Math.round(cartTotal / 2));
  const splitUpi = Math.max(0, Number((cartTotal - splitCash).toFixed(2)));

  // Generate dynamic QR code
  useEffect(() => {
    const upiString = `upi://pay?pa=${settings.upiVpaId}&pn=${encodeURIComponent(settings.payeeName)}&am=${cartTotal.toFixed(2)}&cu=INR`;
    QRCode.toDataURL(upiString, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code error', err));
  }, [cartTotal, settings]);

  // Denomination buttons
  const roundedUp = Math.ceil(cartTotal);
  const quickCashOptions = [
    roundedUp,
    roundedUp <= 500 ? 500 : (roundedUp <= 1000 ? 1000 : 2000),
    2000
  ];

  const changeReturn = Math.max(0, Number((cashReceived - cartTotal).toFixed(2)));

  // Handle enter key to complete
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paymentMode, cashReceived, referenceNo, cartTotal]);

  const handleSubmit = () => {
    triggerAudio('checkout');
    completePayment(
      paymentMode, 
      paymentMode === 'Cash' ? cashReceived : cartTotal,
      referenceNo
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-md max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL PAYABLE
            </span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              ₹{cartTotal.toFixed(2)}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Modes Selector & Scrollable Body */}
        <div className="p-3 sm:p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              SELECT PAYMENT METHOD
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setPaymentMode('Cash'); triggerAudio('beep'); }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'Cash'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/40'
                    : 'border-[#263143] bg-[#141923] text-slate-400 hover:bg-[#1a212e] hover:text-white'
                }`}
              >
                <IndianRupee className="w-4 h-4 mb-1" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMode('UPI'); triggerAudio('beep'); }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'UPI'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/40'
                    : 'border-[#263143] bg-[#141923] text-slate-400 hover:bg-[#1a212e] hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4 mb-1" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMode('Card'); triggerAudio('beep'); }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'Card'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/40'
                    : 'border-[#263143] bg-[#141923] text-slate-400 hover:bg-[#1a212e] hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMode('Split'); triggerAudio('beep'); }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'Split'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/40'
                    : 'border-[#263143] bg-[#141923] text-slate-400 hover:bg-[#1a212e] hover:text-white'
                }`}
              >
                <GitFork className="w-4 h-4 mb-1" />
                <span>Split</span>
              </button>
            </div>
          </div>

          {/* Mode-specific content */}

          {/* 1. Cash Mode */}
          {paymentMode === 'Cash' && (
            <div className="space-y-3 bg-[#131720] p-3.5 rounded-xl border border-[#232b3a]">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1b2230] text-lg font-black text-white font-mono px-3 py-2 rounded-xl border border-[#2b3547] focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center space-x-2">
                {quickCashOptions.map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashReceived(amt)}
                    className="flex-1 py-1.5 rounded-lg bg-[#1a212e] hover:bg-[#252f42] text-xs font-bold text-slate-300 font-mono border border-[#2b3548] transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Change Return Box */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Change to Return:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ₹{changeReturn.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 2. Dynamic UPI QR Mode */}
          {paymentMode === 'UPI' && (
            <div className="flex flex-col items-center bg-[#131720] p-4 rounded-xl border border-[#232b3a] space-y-3 text-center">
              {/* QR Container */}
              <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="UPI Dynamic QR" className="w-40 h-40" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-white">
                  Scan to Pay ₹{cartTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  UPI ID: {settings.upiVpaId}
                </div>
              </div>

              <input
                type="text"
                placeholder="Optional UPI UTR / Reference No"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl border border-[#2b3547] focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* 3. Card Mode */}
          {paymentMode === 'Card' && (
            <div className="bg-[#131720] p-4 rounded-xl border border-[#232b3a] space-y-3">
              <div className="text-xs text-slate-300">
                Swipe or insert customer card in external POS card machine.
              </div>
              <input
                type="text"
                placeholder="Card Authorization / Reference #"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl border border-[#2b3547] focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* 4. Split Mode */}
          {paymentMode === 'Split' && (
            <div className="bg-[#131720] p-4 rounded-xl border border-[#232b3a] space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Cash Part (₹)</span>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1b2230] font-mono font-bold text-white px-2.5 py-1.5 rounded-lg border border-[#2b3547]"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">UPI Part (₹)</span>
                  <input
                    type="text"
                    disabled
                    value={splitUpi.toFixed(2)}
                    className="w-full bg-[#121620] font-mono font-bold text-slate-400 px-2.5 py-1.5 rounded-lg border border-[#232b3a]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#141924] border-t border-[#232b3a] flex items-center justify-between">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Bill (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
