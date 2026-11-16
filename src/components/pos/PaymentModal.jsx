import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import { X, IndianRupee, QrCode, CreditCard, GitFork, CheckCircle2, TriangleAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { roundMoney, validateTender } from '../../domain/billing';
import { isUpiQrImage } from '../../domain/upi';
import Dialog from '../layout/Dialog';

const methods = [
  { value: 'Cash', icon: IndianRupee },
  { value: 'UPI', icon: QrCode },
  { value: 'Card', icon: CreditCard },
  { value: 'Split', icon: GitFork }
];
const field = 'h-11 w-full min-w-0 rounded-lg border border-[#2b3547] bg-[#1b2230] px-3 text-base text-white';
const amountField = `${field} pl-7 font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

export default function PaymentModal() {
  const { cartTotal, completePayment, closeModal, settings, isPaying, paymentRevision } = useApp();
  const initialRevision = useRef(paymentRevision);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [cashReceived, setCashReceived] = useState(String(Math.ceil(cartTotal)));
  const [referenceNo, setReferenceNo] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [splitCash, setSplitCash] = useState(String(roundMoney(cartTotal / 2)));
  const [qr, setQr] = useState(null);
  const [failedQrImage, setFailedQrImage] = useState('');
  const cash = cashReceived.trim() ? Number(cashReceived) : NaN;
  const cashPart = splitCash.trim() ? Number(splitCash) : NaN;
  const splitUpi = roundMoney(cartTotal - cashPart);
  const splitBreakdown = paymentMode === 'Split' ? { cash: cashPart, upi: splitUpi } : null;
  const needsConfirmation = paymentMode !== 'Cash';
  const tenderError = validateTender(paymentMode, cartTotal, paymentMode === 'Cash' ? cash : cartTotal, splitBreakdown);
  const billChanged = paymentRevision !== initialRevision.current;
  const qrAmount = !billChanged && !tenderError
    ? paymentMode === 'UPI' ? cartTotal : paymentMode === 'Split' ? splitUpi : 0
    : 0;
  const recipient = settings.upiVpaId?.trim() || '';
  const validRecipient = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(recipient);
  const storedQrImage = settings.upiQrImage;
  const validQrImage = useMemo(() => isUpiQrImage(storedQrImage), [storedQrImage]);
  const uploadedQr = qrAmount > 0 && validQrImage && storedQrImage !== failedQrImage ? storedQrImage : '';
  const qrKey = qrAmount > 0 && !uploadedQr && validRecipient
    ? `upi://pay?pa=${encodeURIComponent(recipient)}&pn=${encodeURIComponent(settings.payeeName)}&am=${qrAmount.toFixed(2)}&cu=INR`
    : '';
  const qrDataUrl = uploadedQr || (qr?.key === qrKey ? qr.url : '');
  const qrError = qrAmount > 0 && !uploadedQr && (!validRecipient || (qr?.key === qrKey && qr.error));
  const quickCashOptions = [...new Set([Math.ceil(cartTotal), 500, 1000, 2000])]
    .filter(amount => amount >= cartTotal).slice(0, 3);

  useEffect(() => {
    if (!qrKey) return;
    let active = true;
    QRCode.toDataURL(qrKey, { width: 200, margin: 2 }).then(url => {
      if (active) setQr({ key: qrKey, url });
    }).catch(() => {
      if (active) setQr({ key: qrKey, error: true });
    });
    return () => { active = false; };
  }, [qrKey]);

  function changeTender(mode) {
    setPaymentMode(mode);
    setReferenceNo('');
    setConfirmed(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isPaying || tenderError || billChanged || (needsConfirmation && !confirmed)) return;
    completePayment(paymentMode, paymentMode === 'Cash' ? cash : cartTotal,
      referenceNo.trim(), splitBreakdown, initialRevision.current);
  }

  const confirmation = paymentMode === 'Card' ? 'The card terminal approved this payment.' :
    paymentMode === 'Split' && splitUpi === 0 ? 'I received the full cash amount.' :
    paymentMode === 'Split' ? 'I received both the cash and UPI amounts.' :
    'I confirmed receipt in the UPI payment app.';

  return (
    <Dialog label="Payment" onClose={closeModal}>
      <form onSubmit={handleSubmit}
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#2b3547] bg-[#171c26] shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#263143] bg-[#141924] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-300">Total payable</h2>
            <p className="mt-0.5 break-words text-2xl font-bold tabular-nums text-white">₹{cartTotal.toFixed(2)}</p>
          </div>
          <button type="button" aria-label="Close payment" disabled={isPaying} onClick={closeModal}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 space-y-3 overflow-y-auto p-4">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-300">Payment method</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {methods.map(({ value, icon: Icon }) => (
                <button key={value} type="button" disabled={isPaying} aria-pressed={paymentMode === value}
                  onClick={() => changeTender(value)}
                  className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 text-xs font-semibold disabled:opacity-50 ${paymentMode === value
                    ? 'border-orange-500/60 bg-orange-500/10 text-orange-200'
                    : 'border-[#2b3547] bg-[#131720] text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon className="size-4" aria-hidden="true" />
                  {value}
                </button>
              ))}
            </div>
          </fieldset>

          {paymentMode === 'Cash' ? (
            <div className="space-y-3 rounded-xl border border-[#263143] bg-[#131720] p-3">
              <div>
                <label htmlFor="payment-cash" className="mb-1.5 block text-sm font-medium text-slate-200">Cash received</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">₹</span>
                  <input id="payment-cash" type="number" inputMode="decimal" min="0" step="0.01"
                    disabled={isPaying} value={cashReceived} onChange={event => setCashReceived(event.target.value)}
                    className={amountField} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Quick cash amounts">
                {quickCashOptions.map(amount => (
                  <button key={amount} type="button" disabled={isPaying} onClick={() => setCashReceived(String(amount))}
                    className="min-h-11 flex-1 rounded-lg border border-[#2b3547] bg-[#1b2230] px-2 text-xs font-semibold tabular-nums text-slate-200 hover:bg-slate-700">
                    ₹{amount}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300">
                <span className="text-sm font-medium">Change to return</span>
                <span className="break-words font-bold tabular-nums">₹{Math.max(0, cash - cartTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-[#263143] bg-[#131720] p-3">
              {paymentMode === 'Card' && (
                <p className="flex items-start gap-2 text-sm text-slate-300">
                  <CreditCard className="mt-0.5 size-4 shrink-0 text-orange-300" aria-hidden="true" />
                  Process the payment on your card terminal first.
                </p>
              )}

              {paymentMode === 'Split' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Cash + UPI</h3>
                    <button type="button" disabled={isPaying}
                      onClick={() => { setSplitCash(String(roundMoney(cartTotal / 2))); setConfirmed(false); }}
                      className="min-h-11 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 text-xs font-semibold text-orange-200 hover:bg-orange-500/20">
                      Split evenly
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <label htmlFor="payment-split-cash" className="mb-1.5 block text-sm font-medium text-slate-200">Cash part</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">₹</span>
                        <input id="payment-split-cash" type="number" inputMode="decimal" min="0" max={cartTotal} step="0.01"
                          disabled={isPaying} value={splitCash}
                          onChange={event => { setSplitCash(event.target.value); setConfirmed(false); }}
                          className={amountField} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span id="payment-split-upi-label" className="mb-1.5 block text-sm font-medium text-slate-200">UPI part</span>
                      <output aria-labelledby="payment-split-upi-label" htmlFor="payment-split-cash"
                        className="flex min-h-11 items-center break-all rounded-lg border border-[#263143] bg-[#10141d] px-3 py-1.5 text-sm font-semibold tabular-nums text-slate-300 sm:text-base">
                        {tenderError ? '—' : `₹${splitUpi.toFixed(2)}`}
                      </output>
                    </div>
                  </div>
                </>
              )}

              {qrDataUrl && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-[#263143] bg-[#10141d] p-3 text-center">
                  <img src={qrDataUrl} alt="UPI QR" className="size-36 rounded-lg bg-white object-contain"
                    onError={uploadedQr ? () => setFailedQrImage(uploadedQr) : undefined} />
                  <div className="w-full min-w-0">
                    <p className="text-sm font-semibold text-white">Scan to pay ₹{qrAmount.toFixed(2)}</p>
                    <p className="mt-0.5 text-xs text-slate-400 [overflow-wrap:anywhere]">
                      {uploadedQr ? 'Enter this amount in your UPI app.' : recipient}
                    </p>
                  </div>
                </div>
              )}
              {qrKey && !qrDataUrl && !qrError && <p role="status" className="text-sm text-slate-400">Generating QR…</p>}
              {qrError && (
                <div role="status" className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-sm text-amber-200">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p><span className="font-semibold">QR unavailable.</span> Confirm receipt separately or use another payment method.</p>
                </div>
              )}

              <div>
                <label htmlFor="payment-reference" className="mb-1.5 block text-sm font-medium text-slate-200">
                  <span>{paymentMode === 'Card' ? 'Card reference' : 'UPI reference'}</span>
                </label>
                <input id="payment-reference" type="text" disabled={isPaying}
                  value={referenceNo} onChange={event => setReferenceNo(event.target.value)}
                  placeholder="Optional" className={field} />
              </div>
            </div>
          )}

          {needsConfirmation && (
            <label className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border border-[#2b3547] bg-[#131720] p-3 text-sm text-slate-200 has-[:checked]:border-orange-500/40 has-[:checked]:bg-orange-500/10">
              <input type="checkbox" checked={confirmed} disabled={isPaying}
                onChange={event => setConfirmed(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-orange-500" />
              <span>{confirmation}</span>
            </label>
          )}
          {(tenderError || billChanged) && (
            <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-sm text-rose-200">
              {billChanged ? 'The bill changed. Close payment and review the order before proceeding.' : tenderError}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[#263143] bg-[#141924] px-4 py-3">
          <button type="button" onClick={closeModal} disabled={isPaying}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit"
            disabled={isPaying || !!tenderError || billChanged || (needsConfirmation && !confirmed)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800 disabled:bg-slate-800 disabled:text-slate-400">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {isPaying ? 'Saving bill…' : 'Complete Bill'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
