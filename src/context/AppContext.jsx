import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  initialSettings,
  initialTables,
  initialCategories,
  initialProducts,
  initialRawMaterials,
  initialCustomers,
  initialOrders,
  initialSuppliers,
  initialPurchases,
  initialExpenses,
  initialStaff,
  initialAuditLogs,
  initialAvailableAddons
} from '../data/initialData';
import { playSound } from '../utils/audio';

const AppContext = createContext();

// Production keys (v2 - Clean Production State without mock transactions)
const STORAGE_KEYS = {
  SETTINGS: 'bb_pos_settings_v2',
  TABLES: 'bb_pos_tables_v2',
  PRODUCTS: 'bb_pos_products_v2',
  RAW: 'bb_pos_raw_v2',
  CUSTOMERS: 'bb_pos_customers_v2',
  ORDERS: 'bb_pos_orders_v2',
  SUPPLIERS: 'bb_pos_suppliers_v2',
  PURCHASES: 'bb_pos_purchases_v2',
  EXPENSES: 'bb_pos_expenses_v2',
  STAFF: 'bb_pos_staff_v2',
  AUDIT: 'bb_pos_audit_v2',
};

function loadStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load from localStorage', e);
  }
  return fallback;
}

export function AppProvider({ children }) {
  // Clear any legacy mock data from v1 keys if present
  useEffect(() => {
    try {
      const legacyKeys = [
        'bb_pos_settings_v1', 'bb_pos_tables_v1', 'bb_pos_products_v1',
        'bb_pos_raw_v1', 'bb_pos_customers_v1', 'bb_pos_orders_v1',
        'bb_pos_suppliers_v1', 'bb_pos_purchases_v1', 'bb_pos_expenses_v1',
        'bb_pos_staff_v1', 'bb_pos_audit_v1'
      ];
      legacyKeys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  const [settings, setSettings] = useState(() => loadStorage(STORAGE_KEYS.SETTINGS, initialSettings));
  const [tables, setTables] = useState(() => loadStorage(STORAGE_KEYS.TABLES, initialTables));
  const [products, setProducts] = useState(() => loadStorage(STORAGE_KEYS.PRODUCTS, initialProducts));
  const [rawMaterials, setRawMaterials] = useState(() => loadStorage(STORAGE_KEYS.RAW, initialRawMaterials));
  const [customers, setCustomers] = useState(() => loadStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers));
  const [orders, setOrders] = useState(() => loadStorage(STORAGE_KEYS.ORDERS, initialOrders));
  const [suppliers, setSuppliers] = useState(() => loadStorage(STORAGE_KEYS.SUPPLIERS, initialSuppliers));
  const [purchases, setPurchases] = useState(() => loadStorage(STORAGE_KEYS.PURCHASES, initialPurchases));
  const [expenses, setExpenses] = useState(() => loadStorage(STORAGE_KEYS.EXPENSES, initialExpenses));
  const [staff, setStaff] = useState(() => loadStorage(STORAGE_KEYS.STAFF, initialStaff));
  const [auditLogs, setAuditLogs] = useState(() => loadStorage(STORAGE_KEYS.AUDIT, initialAuditLogs));

  // Navigation State
  const [activeView, setActiveView] = useState('pos');
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null);

  // Cart State - Clean empty initial cart
  const [cart, setCart] = useState([]);
  const [orderChannel, setOrderChannel] = useState('Dine-In'); // 'Dine-In', 'Takeaway', 'Delivery'
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Auto-sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RAW, JSON.stringify(rawMaterials)); }, [rawMaterials]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          setActiveModal(null);
        }
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        clearCart();
        showToast('Cart Cleared (F1)');
      } else if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('pos-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          openModal('payment');
        } else {
          showToast('Cart is empty', 'warning');
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        openModal('tableSelect');
      } else if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Number(((cartSubtotal * discountPercent) / 100).toFixed(2));
  const discountedSubtotal = cartSubtotal - discountAmount;
  const cgstAmount = Number(((discountedSubtotal * (settings.gstRate / 2)) / 100).toFixed(2));
  const sgstAmount = Number(((discountedSubtotal * (settings.gstRate / 2)) / 100).toFixed(2));
  const cartTotal = Number((discountedSubtotal + cgstAmount + sgstAmount).toFixed(2));

  // Audio helper
  const triggerAudio = (sound = 'beep') => {
    playSound(sound, settings.audioBeepsEnabled);
  };

  // Cart Actions
  const addToCart = (product, variant = null, selectedAddons = [], note = '') => {
    triggerAudio('beep');
    const addonPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const basePrice = variant ? variant.price : product.price;
    const finalPrice = basePrice + addonPrice;

    // Check if duplicate item exists with identical variant and addons
    const existingIndex = cart.findIndex(item => 
      item.productId === product.id &&
      item.variant === (variant ? variant.name : null) &&
      JSON.stringify(item.addons.sort()) === JSON.stringify(selectedAddons.map(a => a.name).sort()) &&
      item.note === note
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem = {
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: product.id,
        name: product.name,
        variant: variant ? variant.name : null,
        addons: selectedAddons.map(a => a.name),
        addonPrice,
        basePrice,
        price: finalPrice,
        quantity: 1,
        note
      };
      setCart([...cart, newItem]);
    }
    showToast(`Added ${product.name} to bill`);
  };

  const updateCartQuantity = (cartItemId, delta) => {
    triggerAudio(delta > 0 ? 'beep' : 'remove');
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeCartItem = (cartItemId) => {
    triggerAudio('remove');
    setCart(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateCartItemNote = (cartItemId, note) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, note } : item));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
    setSelectedCustomer(null);
    setDiscountPercent(0);
  };

  const openModal = (modalName, data = null) => {
    setModalData(data);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Complete Order
  const completePayment = (paymentMethod = 'UPI', amountReceived = null, referenceNo = '') => {
    if (cart.length === 0) return;

    // Generate Invoice Number
    const nextOrderNum = orders.length + 1001;
    const invoiceNo = `${settings.invoicePrefix}${nextOrderNum}`;
    const tokenNo = (orders.length % 99) + 101;

    const newOrder = {
      id: `ord-${Date.now()}`,
      invoiceNo,
      tokenNo,
      createdAt: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
                   new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
      channel: orderChannel,
      table: selectedTable ? selectedTable.name : (orderChannel === 'Dine-In' ? 'Table 1 (Window)' : ''),
      tableId: selectedTable ? selectedTable.id : null,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Guest',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      items: cart.map(item => ({
        id: item.productId,
        name: item.name,
        variant: item.variant,
        addons: item.addons,
        note: item.note,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      itemsSummary: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
      itemsCount: cart.reduce((s, i) => s + i.quantity, 0),
      subtotal: cartSubtotal,
      cgst: cgstAmount,
      sgst: sgstAmount,
      discount: discountAmount,
      total: cartTotal,
      paymentMethod,
      amountReceived: amountReceived || cartTotal,
      referenceNo,
      status: 'Completed',
      cashierName: `${settings.ownerName} (Owner)`
    };

    // Update Raw Materials & Log Audit if Auto-BOM enabled
    if (settings.autoBOMDeduction) {
      const updatedRaw = [...rawMaterials];
      const newAuditEntries = [];

      cart.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.productId);
        if (prod && prod.bom && prod.bom.length > 0) {
          prod.bom.forEach(bomItem => {
            const rawIdx = updatedRaw.findIndex(r => r.id === bomItem.rawId);
            if (rawIdx > -1) {
              const deductQty = bomItem.qty * cartItem.quantity;
              const prev = updatedRaw[rawIdx].currentStock;
              const next = Math.max(0, Number((prev - deductQty).toFixed(3)));
              updatedRaw[rawIdx] = {
                ...updatedRaw[rawIdx],
                currentStock: next,
                status: next <= updatedRaw[rawIdx].minThreshold ? 'Low Stock' : 'Sufficient'
              };

              newAuditEntries.push({
                id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                timestamp: new Date().toLocaleString(),
                type: 'Recipe Deduction',
                itemType: 'Raw Material',
                changeQty: `-${deductQty} ${bomItem.unit}`,
                previousStock: `${prev} ${bomItem.unit}`,
                newStock: `${next} ${bomItem.unit}`,
                notes: `Order ${invoiceNo}: ${cartItem.quantity}x ${cartItem.name} auto-deduction`,
                user: settings.ownerName
              });
            }
          });
        }
      });

      setRawMaterials(updatedRaw);
      if (newAuditEntries.length > 0) {
        setAuditLogs(prev => [...newAuditEntries, ...prev]);
      }
    }

    // Update Customer CRM
    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => {
        if (c.id === selectedCustomer.id || c.phone === selectedCustomer.phone) {
          const updatedSpend = Number((c.totalSpent + cartTotal).toFixed(2));
          const updatedVisits = c.ordersCount + 1;
          return {
            ...c,
            ordersCount: updatedVisits,
            totalSpent: updatedSpend,
            avgOrderValue: Number((updatedSpend / updatedVisits).toFixed(1))
          };
        }
        return c;
      }));
    }

    // Update Table status
    if (selectedTable && orderChannel === 'Dine-In') {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Occupied' } : t));
    }

    // Save order
    setOrders([newOrder, ...orders]);

    // Audio & Confetti
    triggerAudio('checkout');
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Reset Cart
    clearCart();

    // Show Receipt Modal for this new order
    openModal('receipt', newOrder);
    showToast(`Order ${invoiceNo} completed successfully!`);
  };

  // Reset to Clean Production State (Zero Mock Data)
  const resetDemoData = () => {
    setSettings(initialSettings);
    setTables(initialTables);
    setProducts(initialProducts);
    setRawMaterials(initialRawMaterials);
    setCustomers([]);
    setOrders([]);
    setSuppliers([]);
    setPurchases([]);
    setExpenses([]);
    setStaff(initialStaff);
    setAuditLogs([]);
    clearCart();
    showToast('Reset to clean production state (Zero Mock Data)!');
  };

  // Export Database JSON
  const exportDatabase = () => {
    const data = {
      settings,
      tables,
      products,
      rawMaterials,
      customers,
      orders,
      suppliers,
      purchases,
      expenses,
      staff,
      auditLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brew-bite-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded!');
  };

  // Menu items cannot be deleted
  const deleteProduct = () => {
    showToast('Menu items are protected and cannot be deleted', 'warning');
  };

  // Raw Material Stock Adjust
  const adjustRawStock = (rawId, changeQty, reason = 'Manual audit adjustment') => {
    const raw = rawMaterials.find(r => r.id === rawId);
    if (!raw) return;
    const prev = raw.currentStock;
    const next = Math.max(0, Number((prev + changeQty).toFixed(3)));

    setRawMaterials(prevList => prevList.map(r => {
      if (r.id === rawId) {
        return {
          ...r,
          currentStock: next,
          status: next <= r.minThreshold ? 'Low Stock' : 'Sufficient'
        };
      }
      return r;
    }));

    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        type: changeQty >= 0 ? 'Stock Addition' : 'Manual Audit',
        itemType: 'Raw Material',
        changeQty: `${changeQty >= 0 ? '+' : ''}${changeQty} ${raw.unit}`,
        previousStock: `${prev} ${raw.unit}`,
        newStock: `${next} ${raw.unit}`,
        notes: reason,
        user: settings.ownerName
      },
      ...prev
    ]);
    showToast(`Stock updated for ${raw.name}`);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        tables,
        setTables,
        categories: initialCategories,
        products,
        setProducts,
        deleteProduct,
        rawMaterials,
        setRawMaterials,
        customers,
        setCustomers,
        orders,
        setOrders,
        suppliers,
        setSuppliers,
        purchases,
        setPurchases,
        expenses,
        setExpenses,
        staff,
        setStaff,
        auditLogs,
        setAuditLogs,
        addons: initialAvailableAddons,

        activeView,
        setActiveView,
        activeModal,
        openModal,
        closeModal,
        modalData,
        toast,
        showToast,

        cart,
        addToCart,
        updateCartQuantity,
        removeCartItem,
        updateCartItemNote,
        clearCart,
        orderChannel,
        setOrderChannel,
        selectedTable,
        setSelectedTable,
        selectedCustomer,
        setSelectedCustomer,
        discountPercent,
        setDiscountPercent,
        cartSubtotal,
        discountAmount,
        cgstAmount,
        sgstAmount,
        cartTotal,

        completePayment,
        resetDemoData,
        exportDatabase,
        adjustRawStock,
        triggerAudio
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
