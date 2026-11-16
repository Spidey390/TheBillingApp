import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { businessDate, dateRange, inRange } from '../../domain/dates';
import RefundDialog from './RefundDialog';
import FilterToolbar from '../layout/FilterToolbar';

const all = 'All';
const timeOptions = [all, 'Today', 'Yesterday', 'This Week', 'This Month'].map(value => ({ value }));
const channelOptions = [all, 'Dine In', 'Takeaway', 'Delivery'].map(value => ({ value }));

export default function OrdersKDS() {
  const { orders, openModal, isOwner, settings } = useApp();

  const [timeFilter, setTimeFilter] = useState(all);
  const [channelFilter, setChannelFilter] = useState(all);
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);

  // Filter orders
  const today = businessDate();
  const filteredOrders = useMemo(() => {
    const range = dateRange(timeFilter, today);
    return orders.filter(order => {
      if (!inRange(businessDate(order.createdAt), range)) return false;

      // Channel Filter
      if (channelFilter !== all) {
        const normalizedChan = channelFilter.replace('-', ' ').toLowerCase();
        const orderChan = order.channel.replace('-', ' ').toLowerCase();
        if (orderChan !== normalizedChan) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchInvoice = order.invoiceNo.toLowerCase().includes(q);
        const matchCust = order.customerName.toLowerCase().includes(q) || (order.customerPhone && order.customerPhone.includes(q));
        const matchTable = order.table && order.table.toLowerCase().includes(q);
        if (!matchInvoice && !matchCust && !matchTable) return false;
      }

      return true;
    });
  }, [orders, timeFilter, channelFilter, search, today]);

  return (
    <div className="w-full max-w-7xl mx-auto min-w-0 app-gutters py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Orders</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Track customer orders, billing history, and reprint invoices.
        </p>
      </div>

      <FilterToolbar search={search} onSearch={setSearch} searchLabel="Search orders" placeholder="Search orders…"
        groups={[
          { name: 'date', label: 'Order date', value: timeFilter, defaultValue: all, options: timeOptions },
          { name: 'channel', label: 'Order channel', value: channelFilter, defaultValue: all, options: channelOptions }
        ]}
        onApply={({ date, channel }) => {
          setTimeFilter(date);
          setChannelFilter(channel);
        }} />

      {/* Orders Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            {orders.length ? 'No orders match these filters.' : 'No bills have been saved yet.'}
          </div>
        ) : (
          <div className="xl:overflow-x-auto">
            <table role="table" aria-label="Order history" className="responsive-records mobile-table orders-records w-full text-left text-xs border-collapse min-w-[700px]">
              <thead role="rowgroup">
                <tr role="row" className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th role="columnheader" scope="col" aria-label="Serial number" className="record-serial px-3 py-3 text-center">No.</th>
                  <th role="columnheader" scope="col" className="py-3 px-4 order-record-invoice">
                    <span className="md:hidden">Invoice</span><span className="hidden md:inline">Invoice / Order</span>
                  </th>
                  <th role="columnheader" scope="col" className="py-3 px-4 mobile-table-extra">Date & Time</th>
                  <th role="columnheader" scope="col" className="py-3 px-4">
                    <span className="md:hidden">Customer</span><span className="hidden md:inline">Customer &amp; Channel</span>
                  </th>
                  <th role="columnheader" scope="col" className="py-3 px-4 mobile-table-extra">Items</th>
                  <th role="columnheader" scope="col" className="order-record-mobile-payment">Payment</th>
                  <th role="columnheader" scope="col" className="py-3 px-4 order-record-total">
                    <span className="md:hidden">Total</span><span className="hidden md:inline">Total Amount</span>
                  </th>
                  <th role="columnheader" scope="col" className="py-3 px-4 mobile-table-extra">Payment</th>
                  <th role="columnheader" scope="col" className="py-3 px-4 mobile-table-extra">Status</th>
                  <th role="columnheader" scope="col" className="py-3 px-4 mobile-table-extra text-right">Actions</th>
                </tr>
              </thead>
              <tbody role="rowgroup" className="divide-y divide-[#1e2636]">
                {filteredOrders.map((order, index) => {
                  const isCompleted = order.status === 'Completed' && !order.refund;
                  const isPreparing = order.status === 'Preparing';
                  const isReady = order.status === 'Ready';

                  return (
                    <tr role="row"
                      key={order.id}
                      className="hover:bg-[#18202d] transition-colors group"
                    >
                      <td role="cell" className="record-serial px-3 py-3 text-center tabular-nums text-slate-400">{index + 1}</td>
                      {/* Invoice & Token */}
                      <td role="cell" className="py-3 px-4 record-title">
                        <button type="button" aria-label={`View invoice ${order.invoiceNo}`} aria-haspopup="dialog"
                          onClick={() => openModal('receipt', order)}
                          className="min-h-11 w-full rounded-md text-left font-mono font-semibold text-orange-300 underline-offset-2 hover:underline md:hidden">
                          {order.invoiceNo}
                        </button>
                        <div className="hidden md:block">
                          <div className="flex items-baseline gap-2">
                            <span className="hidden tabular-nums text-xs font-medium text-slate-400 md:max-xl:inline">
                              <span className="sr-only">Serial number </span>{index + 1}.
                            </span>
                            <span className="font-bold text-white font-mono">{order.invoiceNo}</span>
                          </div>
                          <div className="text-xs text-slate-400">Token #{order.tokenNo}</div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td role="cell" className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap mobile-table-extra"><span className="record-label" aria-hidden="true">Date and time</span>
                        {order.displayDate}
                      </td>

                      {/* Customer & Channel */}
                      <td role="cell" className="py-3 px-4"><span className="record-label" aria-hidden="true">Customer</span>
                        <div className="font-bold text-slate-200">{order.customerName}</div>
                        <div className="mobile-table-extra text-[10px] text-orange-400/90 font-medium">
                          {order.channel.toUpperCase()} {order.table ? `• ${order.table.toUpperCase()}` : ''}
                        </div>
                      </td>

                      {/* Items */}
                      <td role="cell" className="py-3 px-4 max-w-xs record-full mobile-table-extra"><span className="record-label" aria-hidden="true">Items</span>
                        <div className="truncate text-slate-300 font-medium">{order.itemsSummary}</div>
                        <div className="text-[10px] text-slate-500">{order.itemsCount} total items</div>
                      </td>

                      <td role="cell" className="order-record-mobile-payment text-slate-300">
                        {order.paymentMethod || '—'}
                      </td>

                      {/* Total Amount */}
                      <td role="cell" className="py-3 px-4 font-bold font-mono text-white text-sm order-record-total"><span className="record-label" aria-hidden="true">Total</span>
                        ₹{order.total.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td role="cell" className="py-3 px-4 mobile-table-extra"><span className="record-label" aria-hidden="true">Payment</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1c2433] text-slate-300 border border-[#2d3a4e]">
                          {order.paymentMethod === 'Split' && order.splitBreakdown
                            ? `Split (Cash ₹${order.splitBreakdown.cash} + UPI ₹${order.splitBreakdown.upi})`
                            : order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td role="cell" className="py-3 px-4 mobile-table-extra"><span className="record-label" aria-hidden="true">Status</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isPreparing
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isReady
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {order.refund ? 'Refunded' : order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td role="cell" className="py-3 px-4 text-right record-actions mobile-table-extra">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal('receipt', order)}
                            title="View / Print Receipt" aria-label="View invoice"
                            className="p-1.5 rounded-lg bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white border border-[#2b3547] transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="record-action-text">Invoice</span>
                          </button>
                          {!isOwner && settings.allowStaffRefunds && isCompleted && (
                            <button type="button" className="rounded border border-rose-700 px-2 py-1 text-rose-200"
                              onClick={() => setRefundTarget(order)}>Record refund</button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {refundTarget && <RefundDialog order={refundTarget} onClose={() => setRefundTarget(null)} />}
    </div>
  );
}
