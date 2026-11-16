import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Phone, Search, UserPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from '../layout/Dialog';
import { newId } from '../../domain/ids';
import { normalizePhone } from '../../domain/customers';

const field = 'h-11 w-full min-w-0 rounded-lg border border-[#2a3447] bg-[#1b2230] px-3 text-base text-white';

export default function CustomerSelectModal({ onSelect, onClose }) {
  const { customers, saveCustomer, selectedCustomer, showToast, triggerAudio } = useApp();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const searchRef = useRef(null);
  const returnFocus = useRef(false);

  const query = search.trim().toLowerCase();
  const searchedPhone = normalizePhone(query);
  const filtered = customers.filter(customer => searchedPhone
    ? normalizePhone(customer.phone) === searchedPhone
    : customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email?.toLowerCase().includes(query));
  const canAddNumber = Boolean(searchedPhone && filtered.length === 0);

  useLayoutEffect(() => {
    if (!showAddForm && returnFocus.current) {
      searchRef.current?.focus();
      returnFocus.current = false;
    }
  }, [showAddForm]);

  function addSearchedNumber() {
    if (newPhone !== searchedPhone) {
      setNewName('');
      setNewPhone(searchedPhone);
      setNewEmail('');
    }
    setShowAddForm(true);
  }

  function backToSelection() {
    returnFocus.current = true;
    setShowAddForm(false);
  }

  function dismiss() {
    if (busy) return;
    if (showAddForm) backToSelection();
    else onClose();
  }

  async function linkCustomer(customer) {
    triggerAudio('beep');
    if (!await onSelect(customer)) return false;
    onClose();
    showToast(`Linked customer ${customer.name} to bill`);
    return true;
  }

  async function handleSelect(customer) {
    if (busy) return;
    setBusy(true);
    try {
      await linkCustomer(customer);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    if (busy) return;
    const name = newName.trim();
    const phone = normalizePhone(newPhone);
    if (!name || !phone) {
      showToast(!name ? 'Enter the customer name.' : 'Enter a valid mobile number.', 'error');
      return;
    }
    const created = {
      id: 'cust-' + newId(),
      name,
      phone,
      email: newEmail.trim(),
      ordersCount: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      notes: 'New member registered at POS'
    };
    setBusy(true);
    try {
      if (!await saveCustomer(created) || await linkCustomer(created)) return;
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setSearch(phone);
      backToSelection();
    } finally {
      setBusy(false);
    }
  }

  const title = showAddForm ? 'Add customer' : 'Customer selection';

  return (
    <Dialog label={title} onClose={dismiss}>
      <div className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#2b3547] bg-[#171c26] shadow-2xl">
        <header className="flex shrink-0 items-center gap-2 border-b border-[#232b3a] bg-[#141924] px-4 py-2">
          {showAddForm && (
            <button type="button" aria-label="Back to customer selection" disabled={busy} onClick={backToSelection}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          <h2 className="min-w-0 flex-1 text-base font-bold text-white">{title}</h2>
          <button type="button" aria-label="Close" disabled={busy} onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {showAddForm ? (
          <form onSubmit={handleCreateCustomer} autoComplete="off" className="flex min-h-0 flex-col">
            <fieldset disabled={busy} className="min-h-0 min-w-0 space-y-3 overflow-y-auto p-4 text-sm">
              <div>
                <label htmlFor="pos-customer-name" className="mb-1.5 block font-semibold text-slate-200">Full name</label>
                <input id="pos-customer-name" value={newName} onChange={event => setNewName(event.target.value)}
                  required autoFocus className={field} />
              </div>
              <div>
                <label htmlFor="pos-customer-mobile" className="mb-1.5 block font-semibold text-slate-200">Mobile number</label>
                <input id="pos-customer-mobile" type="tel" value={newPhone} onChange={event => setNewPhone(event.target.value)}
                  required className={field} />
              </div>
              <div>
                <label htmlFor="pos-customer-email" className="mb-1.5 block font-semibold text-slate-200">
                  Email <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input id="pos-customer-email" type="email" value={newEmail} onChange={event => setNewEmail(event.target.value)}
                  className={field} />
              </div>
            </fieldset>
            <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-[#232b3a] bg-[#141924] px-4 py-3">
              <button type="button" disabled={busy} onClick={backToSelection}
                className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={busy}
                className="min-h-11 rounded-lg bg-orange-700 px-4 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-50">
                {busy ? 'Saving…' : 'Save & select'}
              </button>
            </footer>
          </form>
        ) : (
          <>
            <div className="shrink-0 border-b border-[#232b3a] px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input ref={searchRef} type="search" aria-label="Search customers by name, mobile number or email"
                  placeholder="Name or mobile number"
                  value={search} onChange={event => setSearch(event.target.value)} className={`${field} pl-9`} />
              </div>
            </div>

            <div className="min-h-0 space-y-2 overflow-y-auto p-4">
              {canAddNumber ? (
                <button type="button" disabled={busy} onClick={addSearchedNumber}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-left hover:bg-orange-500/20 disabled:opacity-50">
                  <UserPlus className="size-5 shrink-0 text-orange-300" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-orange-200">Add this number</span>
                    <span className="mt-0.5 block break-all text-xs tabular-nums text-slate-300">{searchedPhone}</span>
                  </span>
                </button>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  {query ? 'No customers match your search.' : 'Search for a mobile number to add your first customer.'}
                </p>
              ) : filtered.map(customer => {
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <button key={customer.id} type="button" disabled={busy} aria-pressed={isSelected} onClick={() => handleSelect(customer)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left disabled:opacity-60 ${isSelected
                      ? 'border-orange-500/40 bg-orange-500/10'
                      : 'border-[#263143] bg-[#141923] hover:border-slate-600 hover:bg-slate-800/70'}`}>
                    <span className="min-w-0 space-y-1">
                      <span className="block break-words text-sm font-semibold text-white">{customer.name}</span>
                      <span className="flex items-center gap-1.5 break-all text-xs tabular-nums text-slate-400">
                        <Phone className="size-3.5 shrink-0" aria-hidden="true" /> {customer.phone}
                      </span>
                    </span>
                    {isSelected && <Check className="size-5 shrink-0 text-orange-300" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
