import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { initialSettings, initialCategories } from '../data/initialData';
import { playSound } from '../utils/audio';
import { calculateBill, validateTender } from '../domain/billing';
import { normalizePhone } from '../domain/customers';
import { mergeSavedCategories } from '../domain/categories';
import { newId } from '../domain/ids';
import { canOpen, homeView } from '../domain/access';
import {
  workspaceRef, initializeWorkspace, watchConfig, watchRows, executeOrderTransaction, saveTableDraft, draftRevision,
  deleteTable, createTable, updateSettings, syncPublicBrand, createExpense, deleteRecord,
  saveUniqueRecord, deleteUniqueRecord, exportDatabaseJSON, importDatabaseJSON,
  resetDatabaseToCleanProduction, refundOrder
} from '../db/db';

const AppContext = createContext();
const emptyList = [];
const emptyDraft = { items: [], customer: null, discountPercent: 0 };
const currentView = role => {
  const view = window.location.hash.slice(1);
  return canOpen(role, view) ? view : homeView(role);
};

function loadCounterDrafts(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function useRows(workspace, name, enabled, onError, attempt, recordedBy) {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!workspace || !enabled) return;
    let active = true;
    const stop = watchRows(workspace, name, rows => {
      if (active) setState({ workspace, rows });
    }, error => { if (active) onError(error); }, recordedBy);
    return () => { active = false; stop(); };
  }, [workspace, name, enabled, onError, attempt, recordedBy]);

  return enabled && state?.workspace === workspace ? state.rows : emptyList;
}

export function AppProvider({ children, operator, signOut }) {
  const isOwner = operator.role === 'owner';
  const [workspace, setWorkspace] = useState(null);
  const [loadedConfig, setLoadedConfig] = useState(null);
  const [dbStatus, setDbStatus] = useState('loading');
  const [bootAttempt, setBootAttempt] = useState(0);
  const settings = loadedConfig?.workspace === workspace ? loadedConfig.settings : initialSettings;
  const isDbReady = dbStatus === 'ready' && loadedConfig?.workspace === workspace;
  const onReadError = React.useCallback(error => {
    console.error('Could not read Firebase POS data', error);
    setDbStatus('unavailable');
  }, []);
  const [activeView, setActiveView] = useState(() => currentView(operator.role));
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const readsOrders = ['orders', 'dashboard', 'reports'].includes(activeView);
  const tables = useRows(workspace, 'tables', !isOwner || ['tables', 'dashboard'].includes(activeView), onReadError, bootAttempt);
  const products = useRows(workspace, 'products', !isOwner || ['menu', 'reports', 'dashboard'].includes(activeView), onReadError, bootAttempt);
  const customers = useRows(workspace, 'customers', !isOwner || ['customers', 'dashboard'].includes(activeView), onReadError, bootAttempt);
  const orderRows = useRows(workspace, 'orders', readsOrders, onReadError, bootAttempt);
  const orders = React.useMemo(() => [...orderRows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orderRows]);
  const expenses = useRows(workspace, 'expenses', (['expenses', 'dashboard'].includes(activeView) || (isOwner && activeView === 'reports')), onReadError, bootAttempt, isOwner ? undefined : operator.uid);
  const categories = React.useMemo(() => {
    const saved = mergeSavedCategories(settings.commonCategories || settings.categories);
    const fromProducts = products.map(p => p.category);
    return mergeSavedCategories(saved, fromProducts);
  }, [settings.commonCategories, settings.categories, products]);

  const [toast, setToast] = useState(null);
  const toastTimeout = useRef();
  useEffect(() => () => clearTimeout(toastTimeout.current), []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const draftStorageKey = `brew-bite-counter-drafts:${operator.uid}:${workspace}`;
  const [counterState, setCounterState] = useState(null);
  const counterDrafts = React.useMemo(() => counterState?.key === draftStorageKey
    ? counterState.drafts : loadCounterDrafts(draftStorageKey), [counterState, draftStorageKey]);
  const [orderChannel, setChannel] = useState('Dine-In');
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const paymentLock = useRef(false);
  const draftLock = useRef(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const selectedTable = tables.find(table => table.id === selectedTableId) || null;
  const draft = (selectedTable ? selectedTable.activeOrder : counterDrafts[orderChannel]) || emptyDraft;
  const cart = draft.items;
  const draftVersion = draftRevision(draft);
  const { upiVpaId, upiQrImage, payeeName } = settings;
  const paymentRevision = React.useMemo(() => JSON.stringify([
    workspace, selectedTableId, orderChannel, draftVersion, upiVpaId, upiQrImage, payeeName
  ]), [workspace, selectedTableId, orderChannel, draftVersion, upiVpaId, upiQrImage, payeeName]);
  const selectedCustomer = draft.customer;
  const discountPercent = draft.discountPercent || 0;
  const bill = calculateBill(cart, discountPercent);

  useEffect(() => {
    let running = true;
    let initializing = false;
    const unsubscribe = onSnapshot(workspaceRef, snapshot => {
      if (snapshot.exists()) {
        setWorkspace(snapshot.data().workspace);
        return;
      }
      if (snapshot.metadata.fromCache || initializing) return;
      if (!isOwner) {
        setDbStatus('setup-required');
        return;
      }
      initializing = true;
      initializeWorkspace().catch(error => { if (running) onReadError(error); });
    }, onReadError);
    return () => { running = false; unsubscribe(); };
  }, [isOwner, bootAttempt, onReadError]);

  useEffect(() => {
    if (!workspace) return;
    setSelectedTableId(null);
    setActiveModal(null);
    return watchConfig(workspace, next => {
      setLoadedConfig({ workspace, settings: next });
      setDbStatus('ready');
    }, onReadError);
  }, [workspace, bootAttempt, onReadError]);

  useEffect(() => {
    if (workspace && isOwner) {
      syncPublicBrand(workspace).catch(error => console.warn('Could not publish the cafe name', error));
    }
  }, [workspace, isOwner]);

  useEffect(() => {
    const navigate = () => {
      const view = currentView(operator.role);
      setActiveView(view);
      if (!paymentLock.current) setActiveModal(null);
      if (view !== 'pos') setIsMobileCartOpen(false);
      setIsMobileMenuOpen(false);
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, [operator.role]);

  function navigate(view) {
    if (!canOpen(operator.role, view) || paymentLock.current) return;
    if (view !== activeView) window.location.hash = view;
    setActiveView(view);
    setIsMobileCartOpen(false);
    setIsMobileMenuOpen(false);
  }

  function showToast(message, type = 'success') {
    clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }

  async function commit(action, message) {
    if (!isDbReady) {
      showToast('Database unavailable. Try reconnecting before making changes.', 'error');
      return false;
    }
    try {
      await action();
      if (message) showToast(message);
      return true;
    } catch (error) {
      showToast(error.message || 'The change could not be saved. Try again.', 'error');
      return false;
    }
  }

  function updateCounterDrafts(next) {
    setCounterState({ key: draftStorageKey, drafts: next });
    try {
      sessionStorage.setItem(draftStorageKey, JSON.stringify(next));
    } catch {
      showToast('Browser storage could not save the counter draft across reloads.', 'warning');
    }
  }

  function buildDraft(current, changes) {
    const next = { ...current, ...changes };
    if (!next.items.length && !next.customer && !next.discountPercent) return null;
    return {
      ...next,
      id: current.id || newId(),
      revision: newId(),
      ...calculateBill(next.items, next.discountPercent || 0),
      updatedAt: new Date().toISOString()
    };
  }

  async function writeDraft(table, current, changes, message) {
    if (isOwner || draftLock.current || paymentLock.current) return false;
    const next = buildDraft(current, changes);
    if (!table) {
      updateCounterDrafts({ ...counterDrafts, [orderChannel]: next });
      if (message) showToast(message);
      return true;
    }

    draftLock.current = true;
    setIsDraftSaving(true);
    try {
      return await commit(
        () => saveTableDraft(workspace, table.id, draftRevision(table.activeOrder), next),
        message
      );
    } finally {
      draftLock.current = false;
      setIsDraftSaving(false);
    }
  }

  async function selectTable(table) {
    if (isOwner || draftLock.current || paymentLock.current) return false;
    const current = table && tables.find(row => row.id === table.id);
    if (table && !current) return false;
    const counter = counterDrafts['Dine-In'];
    if (current && !current.activeOrder?.items.length && counter?.items.length &&
        window.confirm(`Move the current dine-in bill to ${current.name}? Cancel keeps the bill at the counter.`)) {
      if (!await writeDraft(current, counter, {})) return false;
      updateCounterDrafts({ ...counterDrafts, 'Dine-In': null });
    }
    setSelectedTableId(current?.id ?? null);
    if (current) setChannel('Dine-In');
    return true;
  }

  function setOrderChannel(channel) {
    if (isOwner || channel === orderChannel || paymentLock.current || draftLock.current) return;
    setSelectedTableId(null);
    setChannel(channel);
  }

  function triggerAudio(sound = 'beep') {
    playSound(sound, settings.audioBeepsEnabled);
  }

  function addToCart(product, variant = null, selectedAddons = [], note = '') {
    const addonNames = selectedAddons.map(addon => addon.name);
    const addonPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const basePrice = variant ? variant.price : product.price;
    const price = basePrice + addonPrice;
    const existing = cart.find(item =>
      item.productId === product.id && item.variant === (variant?.name ?? null) &&
      item.price === price && item.note === note &&
      JSON.stringify([...(item.addons ?? [])].sort()) === JSON.stringify([...addonNames].sort())
    );
    const items = existing
      ? cart.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, {
          id: newId(), productId: product.id, name: product.name, category: product.category,
          variant: variant?.name ?? null, addons: addonNames, addonPrice, basePrice, price, quantity: 1, note
        }];
    return writeDraft(selectedTable, draft, { items }, `Added ${product.name} to bill`).then(saved => {
      if (saved) triggerAudio();
      return saved;
    });
  }

  function editItems(table, transform) {
    const current = table ? table.activeOrder || emptyDraft : draft;
    return writeDraft(table, current, { items: transform(current.items) });
  }

  const adjustQuantity = (items, id, delta) => items
    .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
    .filter(item => item.quantity > 0);
  const removeItem = (items, id) => items.filter(item => item.id !== id);
  const tableById = id => tables.find(row => row.id === id);

  function editTableItems(id, transform) {
    const table = tableById(id);
    if (table) return editItems(table, transform);
  }

  async function clearCart() {
    if (cart.length && !window.confirm('Discard all items in this bill?')) return;
    if (await writeDraft(selectedTable, draft, emptyDraft)) setSelectedTableId(null);
  }

  function clearTableOrder(id) {
    const table = tableById(id);
    if (table) return writeDraft(table, table.activeOrder || emptyDraft, emptyDraft, `Order cleared for ${table.name}`);
  }

  function openModal(name, data = null) {
    setModalData(data);
    setActiveModal(name);
  }

  function closeModal() {
    if (paymentLock.current) return;
    setActiveModal(null);
    setModalData(null);
  }

  function reviewTableCart(table) {
    if (isOwner) return;
    const current = tableById(table.id);
    if (!current?.activeOrder?.items.length) {
      showToast('This table has no active order to bill.', 'warning');
      return;
    }
    if (draftLock.current || paymentLock.current) return;
    setSelectedTableId(current.id);
    setChannel('Dine-In');
    navigate('pos');
    setIsMobileCartOpen(!window.matchMedia('(min-width: 1024px)').matches);
  }

  function setCartCustomer(customer, expectedRevision = paymentRevision) {
    if (expectedRevision !== paymentRevision || (selectedTableId && !selectedTable)) {
      showToast('The bill changed. Review the cart before updating the customer.', 'error');
      return false;
    }
    return writeDraft(selectedTable, draft, { customer });
  }

  async function completePayment(paymentMethod, amountReceived, referenceNo, splitBreakdown, expectedRevision) {
    if (isOwner || paymentLock.current || draftLock.current) return false;
    if (expectedRevision !== paymentRevision || !isDbReady || !cart.length || (selectedTableId && !selectedTable) ||
        (selectedTable && orderChannel !== 'Dine-In')) {
      showToast('The bill is unavailable. Review the current order before settling.', 'error');
      return false;
    }
    const tenderError = validateTender(paymentMethod, bill.total, amountReceived, splitBreakdown);
    if (tenderError) {
      showToast(tenderError, 'error');
      return false;
    }

    paymentLock.current = true;
    setIsPaying(true);
    try {
      const now = new Date();
      const { brandName, streetAddress, city, state, pincode, phone, receiptFooterMessage,
        termsAndConditions, license } = settings;
      const order = await executeOrderTransaction(workspace, {
        order: {
          id: draft.id ? `ord-${draft.id}` : `ord-legacy-${selectedTable.id}-${draftRevision(draft)}`,
          draftRevision: draftRevision(draft),
          createdAt: now.toISOString(),
          displayDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
          channel: orderChannel, table: selectedTable?.name ?? '', tableId: selectedTable?.id ?? null,
          customerName: selectedCustomer?.name ?? 'Walk-in Guest', customerPhone: selectedCustomer?.phone ?? '',
          items: cart.map(({ productId, name, category, variant, addons, note, price, quantity }) =>
            ({ id: productId, name, category, variant, addons, note, price, quantity, total: price * quantity })),
          itemsSummary: cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
          itemsCount: cart.reduce((total, item) => total + item.quantity, 0),
          ...bill,
          merchant: { brandName, streetAddress, city, state, pincode, phone, receiptFooterMessage,
            termsAndConditions, license },
          paymentMethod, splitBreakdown, amountReceived, referenceNo,
          status: 'Completed', cashierName: operator.name || operator.email, cashierUid: operator.uid
        },
        tableRevision: draftRevision(draft),
        customerId: selectedCustomer?.id
      });

      if (!selectedTable) updateCounterDrafts({ ...counterDrafts, [orderChannel]: null });
      setSelectedTableId(null);
      setIsMobileCartOpen(false);
      openModal('receipt', order);
      showToast(`Order ${order.invoiceNo} saved and completed.`);
      try {
        triggerAudio('checkout');
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        }
      } catch (error) {
        console.warn('Checkout effects unavailable', error);
      }
      return true;
    } catch (error) {
      console.error('Order settlement failed', error);
      showToast(error.code ? 'Bill was not saved. Keep the tender details and retry saving.' : error.message, 'error');
      return false;
    } finally {
      paymentLock.current = false;
      setIsPaying(false);
    }
  }

  function clearWorkspace() {
    updateCounterDrafts({});
    setSelectedTableId(null);
    setChannel('Dine-In');
    setActiveModal(null);
    setModalData(null);
  }

  async function exportDatabase() {
    await commit(async () => {
      const data = await exportDatabaseJSON(workspace);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `brew-bite-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'Database backup downloaded.');
  }

  async function restoreWorkspace(action, message) {
    if (paymentLock.current || draftLock.current) return false;
    const saved = await commit(action, message);
    if (saved) clearWorkspace();
    return saved;
  }

  function saveCustomer(customer) {
    const phone = normalizePhone(customer.phone);
    if (!phone) {
      showToast('Enter a valid phone number.', 'error');
      return false;
    }
    return commit(() => saveUniqueRecord(workspace, 'customers', { ...customer, phone }), 'Customer saved.');
  }

  return (
    <AppContext.Provider value={{
      dbStatus, isDbReady, dbName: 'Cloud Firestore', operator, isOwner, signOut,
      retryDatabase: () => { setDbStatus('loading'); setBootAttempt(attempt => attempt + 1); },
      settings, tables, products, customers, orders, expenses,
      categories,
      setSettings: changes => commit(() => updateSettings(workspace, changes), 'Settings saved.'),
      createTable: table => commit(() => createTable(workspace, table), 'Table created.'),
      deleteTable: id => commit(() => deleteTable(workspace, id), 'Table removed.'),
      saveProduct: product => commit(() => saveUniqueRecord(workspace, 'products', product), 'Product saved.'),
      deleteProduct: id => commit(() => deleteUniqueRecord(workspace, 'products', id), 'Product removed.'),
      clearAllProducts: () => commit(async () => {
        for (const product of products) {
          await deleteUniqueRecord(workspace, 'products', product.id);
        }
      }, 'All menu products removed.'),
      saveCustomer, deleteCustomer: id => commit(() => deleteUniqueRecord(workspace, 'customers', id), 'Customer removed.'),
      saveExpense: record => commit(() => createExpense(workspace, { ...record, recordedBy: operator.uid, recordedByName: operator.name || operator.email }), 'Expense recorded.'),
      deleteExpense: id => commit(() => deleteRecord(workspace, 'expenses', id), 'Expense removed.'),
      activeView, setActiveView: navigate, activeModal, openModal, closeModal, modalData, toast, showToast,
      isSidebarCollapsed, setIsSidebarCollapsed, isMobileCartOpen, setIsMobileCartOpen, isMobileMenuOpen, setIsMobileMenuOpen,
      cart, addToCart, clearCart, orderChannel, setOrderChannel, selectedTable, setSelectedTable: selectTable,
      selectedCustomer, discountPercent,
      setCartCustomer,
      setDiscountPercent: discount => settings.allowCashierDiscounts &&
        writeDraft(selectedTable, draft, { discountPercent: discount }),
      updateCartQuantity: (id, delta) => editItems(selectedTable, items => adjustQuantity(items, id, delta)),
      removeCartItem: id => editItems(selectedTable, items => removeItem(items, id)),
      updateCartItemNote: (id, note) => editItems(selectedTable,
        items => items.map(item => item.id === id ? { ...item, note } : item)),
      updateTableItemQuantity: (tableId, id, delta) => editTableItems(tableId, items => adjustQuantity(items, id, delta)),
      removeTableItem: (tableId, id) => editTableItems(tableId, items => removeItem(items, id)),
      clearTableOrder, reviewTableCart, isPaying, isDraftSaving, paymentRevision,
      refundOrder: (order, reason) => commit(() => refundOrder(workspace, order, {
        reason, recordedAt: new Date().toISOString(), cashierUid: operator.uid, cashierName: operator.name || operator.email
      }), 'Full refund recorded.'),
      cartSubtotal: bill.subtotal, discountAmount: bill.discount,
      cartTotal: bill.total, completePayment, exportDatabase, triggerAudio,
      importDatabase: text => restoreWorkspace(() => importDatabaseJSON(workspace, JSON.parse(text)), 'Database restored.'),
      resetDemoData: () => restoreWorkspace(() => resetDatabaseToCleanProduction(workspace), 'Database reset.')
    }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
