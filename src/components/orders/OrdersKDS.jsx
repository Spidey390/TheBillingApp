import React, { useState, useMemo } from 'react';
import { Search, Eye, Printer, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OrdersKDS() {
  const { orders, setOrders, openModal, showToast } = useApp();

  const [timeFilter, setTimeFilter] = useState('Today'); // 'Today', 'Yesterday', 'This Week', 'This Month', 'All'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled'
  const [channelFilter, setChannelFilter] = useState('All'); // 'All', 'Dine In', 'Takeaway', 'Delivery'
  const [search, setSearch] = useState('');

  const timeOptions = ['Today', 'Yesterday', 'This Week', 'This Month', 'All'];
  const statusOptions = ['All', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  const channelOptions = ['All', 'Dine In', 'Takeaway', 'Delivery'];

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Time Filter (using 2026-10-07 as base anchor matching screenshots)
      if (timeFilter === 'Today') {
        const isToday = order.createdAt.startsWith('2026-10-07') || new Date(order.createdAt).toDateString() === new Date().toDateString();
        if (!isToday) return false;
      } else if (timeFilter === 'Yesterday') {
        const isYesterday = order.createdAt.startsWith('2026-10-06');
        if (!isYesterday) return false;
      } else if (timeFilter === 'This Week') {
        // Oct 03 to Oct 07
        const isWeek = order.createdAt.startsWith('2026-10');
        if (!isWeek) return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      // Channel Filter
      if (channelFilter !== 'All') {
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
  }, [orders, timeFilter, statusFilter, channelFilter, search]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Orders & Kitchen Display</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Track live orders, food prep status, billing history, and reprint invoices.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#141923] p-4 rounded-2xl border border-[#232b3a] space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Time Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#10131a] p-1 rounded-xl border border-[#212837] shrink-0 overflow-x-auto">
            {timeOptions.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  timeFilter === tf
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or customer..."
              className="w-full bg-[#1b2230] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-[#293345] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Secondary Filters: Status & Channel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202737] text-xs">
          {/* Status Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {statusOptions.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 font-bold'
                      : 'bg-[#1b2230] text-slate-400 hover:text-slate-200 border border-[#293345]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-medium">Channel:</span>
            <div className="flex items-center space-x-1">
              {channelOptions.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    channelFilter === ch
                      ? 'bg-orange-500 text-white font-bold'
                      : 'bg-[#1b2230] text-slate-400 hover:text-slate-200 border border-[#293345]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141923] rounded-2xl border border-[#232b3a] overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No orders found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121620] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#232b3a]">
                  <th className="py-3 px-4">Invoice / Order</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer & Channel</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636]">
                {filteredOrders.map((order) => {
                  const isCompleted = order.status === 'Completed';
                  const isPreparing = order.status === 'Preparing';
                  const isReady = order.status === 'Ready';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#18202d] transition-colors group"
                    >
                      {/* Invoice & Token */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">{order.invoiceNo}</div>
                        <div className="text-[10px] text-slate-500">Token #{order.tokenNo}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {order.displayDate}
                      </td>

                      {/* Customer & Channel */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{order.customerName}</div>
                        <div className="text-[10px] text-orange-400/90 font-medium">
                          {order.channel.toUpperCase()} {order.table ? `• ${order.table.toUpperCase()}` : ''}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-300 font-medium">{order.itemsSummary}</div>
                        <div className="text-[10px] text-slate-500">{order.itemsCount} total items</div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 font-bold font-mono text-white text-sm">
                        ₹{order.total.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1c2433] text-slate-300 border border-[#2d3a4e]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
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
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openModal('receipt', order)}
                            title="View / Print Receipt"
                            className="p-1.5 rounded-lg bg-[#1b2230] hover:bg-[#252f42] text-slate-400 hover:text-white border border-[#2b3547] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openModal('receipt', order)}
                            title="Quick Print"
                            className="p-1.5 rounded-lg bg-[#1b2230] hover:bg-orange-500 text-slate-400 hover:text-white border border-[#2b3547] transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
}
