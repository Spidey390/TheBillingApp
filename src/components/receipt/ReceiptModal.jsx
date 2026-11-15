import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ReceiptModal() {
  const { modalData, closeModal, settings, orders } = useApp();
  // If modalData is provided use it; otherwise fallback to the most recent order or BB-1008
  const order = modalData || orders[0];

  const [format, setFormat] = useState('Thermal 80mm'); // 'Thermal 80mm', 'Thermal 58mm', 'A4 Invoice', 'KOT (Kitchen)'
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!order) return;
    const upiString = `upi://pay?pa=${settings.upiVpaId}&pn=${encodeURIComponent(settings.payeeName)}&am=${order.total.toFixed(2)}&cu=INR`;
    QRCode.toDataURL(upiString, { width: 140, margin: 1 })
      .then(url => setQrCodeUrl(url))
      .catch(e => console.error(e));
  }, [order, settings]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="p-4 bg-[#141924] border-b border-[#232b3a] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Invoice & Print View</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {order.invoiceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Order #{order.id} • Token #{order.tokenNo}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection Toolbar */}
        <div className="px-4 py-2 bg-[#121620] border-b border-[#212837] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            {['Thermal 80mm', 'Thermal 58mm', 'A4 Invoice', 'KOT (Kitchen)'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  format === fmt
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-[#181e2a] text-slate-400 hover:text-slate-200 border border-[#252f40]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#1a212e] hover:bg-[#242e40] text-slate-300 border border-[#283244] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-6 bg-[#0c0f15] overflow-y-auto flex justify-center items-start flex-1 min-h-[380px]">
          {/* Printable Container */}
          <div
            id="printable-receipt"
            className={`bg-white text-slate-900 shadow-2xl p-6 transition-all font-mono select-text border border-slate-200 ${
              format === 'Thermal 58mm'
                ? 'w-[280px] text-[10px] leading-tight'
                : format === 'Thermal 80mm'
                ? 'w-[360px] text-[11px] leading-relaxed'
                : format === 'KOT (Kitchen)'
                ? 'w-[320px] text-[12px] leading-relaxed'
                : 'w-[520px] text-xs p-8' // A4
            }`}
          >
            {/* KOT View */}
            {format === 'KOT (Kitchen)' ? (
              <div className="space-y-3">
                <div className="text-center border-b-2 border-dashed border-slate-900 pb-3">
                  <h2 className="text-sm font-black tracking-wider uppercase">
                    KITCHEN ORDER TICKET (KOT)
                  </h2>
                  <div className="text-base font-black mt-1">Token #{order.tokenNo}</div>
                </div>

                <div className="flex justify-between text-[11px] font-bold">
                  <span>Type: {order.channel.toUpperCase()}</span>
                  <span>{order.displayDate?.split(' ')[0] || 'Today'}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Table: {order.table || 'Counter'}</span>
                  <span>{order.displayDate?.split(' ').slice(1).join(' ') || ''}</span>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-slate-900 py-2 my-2 space-y-2">
                  <div className="flex justify-between font-black uppercase text-[10px] text-slate-700">
                    <span>ITEM</span>
                    <span>QTY</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start font-bold">
                      <div>
                        <div>{it.name}</div>
                        {it.variant && <div className="text-[10px] text-slate-600">[{it.variant}]</div>}
                        {it.note && <div className="text-[10px] text-red-600 font-bold">* NOTE: {it.note}</div>}
                      </div>
                      <span className="text-sm font-black ml-2">{it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-700 text-center pt-2">
                  Server / Cashier: {order.cashierName || settings.ownerName}
                </div>
              </div>
            ) : (
              /* Regular Thermal Invoice (58mm, 80mm, A4) */
              <div className="space-y-3">
                {/* Store Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-slate-800 pb-3">
                  <h2 className="text-sm font-black tracking-wider uppercase">{settings.brandName}</h2>
                  <p className="text-[10px]">{settings.streetAddress}</p>
                  <p className="text-[10px]">{settings.city}, {settings.state} - {settings.pincode}</p>
                  <p className="text-[10px]">Phone: {settings.phone}</p>
                  <p className="text-[10px] font-bold">GSTIN: {settings.gstin}</p>
                </div>

                {/* Order Meta */}
                <div className="border-b border-dashed border-slate-800 pb-2 space-y-1 text-[10px]">
                  <div className="flex justify-between font-bold">
                    <span>{order.invoiceNo}</span>
                    <span>Token #{order.tokenNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{order.displayDate}</span>
                    <span className="font-bold">{order.channel}</span>
                  </div>
                  {order.customerName && order.customerName !== 'Walk-in Guest' && (
                    <div>Cust: {order.customerName} ({order.customerPhone})</div>
                  )}
                  {order.table && (
                    <div>Table: {order.table}</div>
                  )}
                </div>

                {/* Items Table */}
                <div className="space-y-1.5 border-b border-dashed border-slate-800 pb-2">
                  <div className="flex justify-between font-black text-[10px] uppercase pb-1 border-b border-slate-300">
                    <span className="flex-1">ITEM</span>
                    <span className="w-8 text-center">QTY</span>
                    <span className="w-16 text-right">AMT</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-start">
                        <span className="flex-1 font-bold">{it.name}</span>
                        <span className="w-8 text-center">{it.quantity}</span>
                        <span className="w-16 text-right font-bold">₹{it.total.toFixed(2)}</span>
                      </div>
                      {it.variant && (
                        <div className="text-[9px] text-slate-600 pl-1">[{it.variant}]</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>CGST (2.5%):</span>
                    <span>₹{order.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%):</span>
                    <span>₹{order.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1.5 border-t-2 border-dashed border-slate-900 font-black text-xs">
                    <span>GRAND TOTAL:</span>
                    <span className="text-sm">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1">
                    <span>Payment:</span>
                    <span className="font-bold">{order.paymentMethod}</span>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="flex flex-col items-center pt-2 border-t border-dashed border-slate-800 space-y-1">
                    <img src={qrCodeUrl} alt="UPI QR" className="w-24 h-24" />
                    <span className="text-[9px] font-bold">Scan & Pay via any UPI App</span>
                  </div>
                )}

                {/* Receipt Footer */}
                <div className="text-center text-[9px] space-y-1 pt-2 border-t border-dashed border-slate-800">
                  <p className="font-bold">{settings.receiptFooterMessage}</p>
                  <p className="text-[8px] text-slate-600">{settings.termsAndConditions}</p>
                  <p className="text-[8px] text-slate-500 pt-1">
                    Powered by CaffeFlow POS ({settings.license})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#141924] border-t border-[#232b3a] flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[#1b2230] border border-[#2c374a] font-mono text-slate-300">Ctrl+P</kbd> or click Print.
          </span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg font-semibold bg-[#1a212e] hover:bg-[#252f42] text-slate-300 hover:text-white border border-[#2b3548] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
