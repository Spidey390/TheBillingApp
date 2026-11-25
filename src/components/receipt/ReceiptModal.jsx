import React, { useState } from 'react';
import Dialog from '../layout/Dialog';
import { X, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import RefundDialog from '../orders/RefundDialog';

export default function ReceiptModal() {
  const { modalData, closeModal, settings, orders, isOwner, activeView } = useApp();
  const order = modalData ? orders.find(row => row.id === modalData.id) ?? modalData : orders[0];
  const [showRefund, setShowRefund] = useState(false);

  if (!order) return null;
  const merchant = order.merchant || settings;
  const canRefundFromHistory = activeView === 'orders' && !isOwner && settings.allowStaffRefunds &&
    order.status === 'Completed' && !order.refund;
  const hasRecordedGst = order.gstRate > 0 || order.cgst > 0 || order.sgst > 0 || Boolean(order.merchant?.gstin);
  const taxRate = Number.isFinite(order.gstRate) ? ` (${order.gstRate / 2}%)` : '';
  const isNarrowPaper = settings.defaultThermalSize?.startsWith('58mm');
  const paperWidth = isNarrowPaper ? '58mm' : '80mm';

  return (
    <>
      <Dialog label="Invoice and print preview" onClose={closeModal}>
        <div className="bg-[#181e28] border border-[#2b3547] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95dvh]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#232b3a] bg-[#141924] p-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400">
                <Printer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Invoice & Print View</h3>
                  <span className="break-all px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {order.invoiceNo || 'Open table'}
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span>Token #{order.tokenNo}</span>
                  <span aria-hidden="true">·</span>
                  <span>Thermal {paperWidth}</span>
                </p>
              </div>
            </div>
            <button
              aria-label="Close invoice" onClick={closeModal}
              className="w-8 h-8 shrink-0 rounded-full bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Receipt Paper Area */}
          <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[#0c0f15] p-3 sm:p-6">
            {/* Printable Container */}
            <div
              id="printable-receipt" style={{ '--paper-width': paperWidth }}
              className={`min-w-0 max-w-full break-words bg-white text-slate-900 shadow-2xl p-6 font-mono select-text border border-slate-200 ${
                isNarrowPaper
                  ? 'w-[280px] text-[10px] leading-tight'
                  : 'w-[360px] text-[11px] leading-relaxed'
              }`}
            >
              <div className="space-y-3">
                {/* Store Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-slate-800 pb-3">
                  <h2 className="text-sm font-black tracking-wider uppercase">{merchant.brandName}</h2>
                  <p className="text-[10px]">{merchant.streetAddress}</p>
                  <p className="text-[10px]">{merchant.city}, {merchant.state} - {merchant.pincode}</p>
                  <p className="text-[10px]">Phone: {merchant.phone}</p>
                  {hasRecordedGst && merchant.gstin && <p className="text-[10px] font-bold">GSTIN: {merchant.gstin}</p>}
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
                        <span className="min-w-0 flex-1 font-bold [overflow-wrap:anywhere]">{it.name}</span>
                        <span className="w-8 text-center">{it.quantity}</span>
                        <span className="w-16 text-right font-bold">₹{it.total.toFixed(2)}</span>
                      </div>
                      {it.variant && (
                        <div className="text-[9px] text-slate-600 pl-1">[{it.variant}]</div>
                      )}
                      {it.addons && it.addons.length > 0 && (
                        <div className="text-[9px] text-slate-600 pl-1">+{it.addons.join(', ')}</div>
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
                  {hasRecordedGst && (
                    <>
                      <div className="flex justify-between">
                        <span>CGST{taxRate}:</span>
                        <span>₹{(order.cgst ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST{taxRate}:</span>
                        <span>₹{(order.sgst ?? 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-baseline pt-1.5 border-t-2 border-dashed border-slate-900 font-black text-xs">
                    <span>GRAND TOTAL:</span>
                    <span className="text-sm">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] pt-1">
                    <span>Payment:</span>
                    <span className="font-bold">
                      {order.paymentMethod === 'Split' && order.splitBreakdown
                        ? `Split (Cash ₹${order.splitBreakdown.cash} + UPI ₹${order.splitBreakdown.upi})`
                        : order.paymentMethod}
                    </span>
                  </div>
                </div>

                {order.paymentMethod === 'Cash' && Number.isFinite(order.amountReceived) && (
                  <div className="flex justify-between text-[10px]">
                    <span>Cash ₹{order.amountReceived.toFixed(2)}</span>
                    <span>Change ₹{Math.max(0, order.amountReceived - order.total).toFixed(2)}</span>
                  </div>
                )}

                {order.status === 'Completed' && (
                  <p className="border-t border-dashed border-slate-800 pt-2 text-center font-bold">{order.refund ? 'Full refund recorded' : 'Paid'}</p>
                )}

                {/* Receipt Footer */}
                <div className="text-center text-[9px] space-y-1 pt-2 border-t border-dashed border-slate-800">
                  <p className="font-bold">{merchant.receiptFooterMessage}</p>
                  <p className="text-[8px] text-slate-600">{merchant.termsAndConditions}</p>
                  <p className="text-[8px] text-slate-500 pt-1">
                    Powered by CaffeFlow POS ({merchant.license})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#232b3a] bg-[#141924] p-3 text-sm">
            {canRefundFromHistory && (
              <button type="button" onClick={() => setShowRefund(true)}
                className="min-h-11 rounded-lg border border-rose-700 px-3 font-semibold text-rose-200 hover:bg-rose-500/10 md:hidden">
                Record refund
              </button>
            )}
            <button type="button" onClick={() => window.print()}
              className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-700 px-4 font-semibold text-white hover:bg-orange-800">
              <Printer className="size-4" aria-hidden="true" /> Print
            </button>
          </footer>
        </div>
      </Dialog>
      {showRefund && <RefundDialog order={order} onClose={() => setShowRefund(false)} />}
    </>
  );
}
