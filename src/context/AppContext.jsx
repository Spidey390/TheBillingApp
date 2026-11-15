import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  initialSettings,
  initialShops,
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
import {
  db,
  initializeDatabase,
  executeOrderTransaction,
  exportDatabaseJSON,
  importDatabaseJSON,
  resetDatabaseToCleanProduction
} from '../db/db';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConnected,
  syncOrderToFirebase,
  syncShopToFirebase,
  syncStaffToFirebase,
  syncSettingsToFirebase,
  subscribeToFirebaseOrders,
  subscribeToFirebaseShops,
  subscribeToFirebaseStaff
} from '../services/firebase';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication & Current User
  // currentUser: { id, name, email, role: 'OWNER' | 'STAFF', designation, shopId, pin }
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bb_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to initial owner for immediate development access
    return initialStaff[0];
  });

  // Shops State
  const [shops, setShops] = useState(initialShops);
  // activeShopId: 'all' (only for OWNER) or specific shop ID e.g. 'shop-1'
  const [activeShopId, setActiveShopId] = useState('all');

  // Master & Transactional State
  const [settings, setSettings] = useState(initialSettings);
  const [tables, setTables] = useState(initialTables);
  const [products, setProducts] = useState(initialProducts);
  const [rawMaterials, setRawMaterials] = useState(initialRawMaterials);
  const [customers, setCustomers] = useState(initialCustomers);
  const [orders, setOrders] = useState(initialOrders);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [staff, setStaff] = useState(initialStaff);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // Database & Cloud Sync Status
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbName] = useState('Dexie IndexedDB (Multi-Outlet ACID)');
  const [firebaseConfig, setFirebaseConfigState] = useState(() => getSavedFirebaseConfig());
  const [isFirebaseSyncActive, setIsFirebaseSyncActive] = useState(() => isFirebaseConnected());

  const updateFirebaseConfig = (config) => {
    saveFirebaseConfig(config);
    setFirebaseConfigState(config);
    const active = Boolean(config && config.apiKey && config.projectId);
    setIsFirebaseSyncActive(active);
    showToast(active ? 'Firebase Cloud Connected! Real-time Web/Mobile Sync is Active.' : 'Disconnected from Firebase Cloud.');
  };

  // Navigation & Responsive State
  const [activeView, setActiveViewRaw] = useState(() => {
    return currentUser?.role === 'OWNER' ? 'owner' : 'pos';
  });

  const setActiveView = (view) => {
    if (currentUser?.role === 'OWNER') {
      if (view === 'pos' || view === 'menu') {
        showToast('Owner cannot make bills or manage menu.', 'warning');
      }
      setActiveViewRaw('owner');
      return;
    }
    if (currentUser?.role === 'STAFF') {
      setActiveViewRaw('pos');
      return;
    }
    setActiveViewRaw(view);
  };

  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cart State - Clean empty initial cart
  const [cart, setCart] = useState([]);
  const [orderChannel, setOrderChannel] = useState('Dine-In'); // 'Dine-In', 'Takeaway', 'Delivery'
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Persist Current User & enforce view lock
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bb_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'OWNER') {
        setActiveViewRaw('owner');
      } else if (currentUser.role === 'STAFF') {
        if (currentUser.shopId) {
          setActiveShopId(currentUser.shopId);
        }
        setActiveViewRaw('pos');
      }
    } else {
      localStorage.removeItem('bb_current_user');
    }
  }, [currentUser]);

  // Load from Dexie IndexedDB on startup
  useEffect(() => {
    async function loadFromDB() {
      try {
        await initializeDatabase();

        // Read all tables from Dexie
        const [
          savedSettings,
          savedShops,
          savedTables,
          savedProducts,
          savedRaw,
          savedCustomers,
          savedOrders,
          savedSuppliers,
          savedPurchases,
          savedExpenses,
          savedStaff,
          savedAudit
        ] = await Promise.all([
          db.settings.get('active_settings'),
          db.shops.toArray(),
          db.diningTables.toArray(),
          db.products.toArray(),
          db.rawMaterials.toArray(),
          db.customers.toArray(),
          db.orders.reverse().sortBy('createdAt'),
          db.suppliers.toArray(),
          db.purchases.toArray(),
          db.expenses.toArray(),
          db.staff.toArray(),
          db.auditLogs.reverse().sortBy('id')
        ]);

        if (savedSettings) setSettings(savedSettings);
        if (savedShops?.length) setShops(savedShops);
        if (savedTables?.length) setTables(savedTables);
        if (savedProducts?.length) setProducts(savedProducts);
        if (savedRaw?.length) setRawMaterials(savedRaw);
        if (savedCustomers) setCustomers(savedCustomers);
        if (savedOrders) setOrders(savedOrders);
        if (savedSuppliers) setSuppliers(savedSuppliers);
        if (savedPurchases) setPurchases(savedPurchases);
        if (savedExpenses) setExpenses(savedExpenses);
        if (savedStaff?.length) setStaff(savedStaff);
        if (savedAudit) setAuditLogs(savedAudit);

        setIsDbReady(true);
        console.log('[Dexie IndexedDB] Multi-Outlet database loaded successfully.');
      } catch (err) {
        console.error('[Dexie IndexedDB] Error loading database:', err);
        setIsDbReady(true);
      }
    }

    loadFromDB();
  }, []);

  // Automatic Reactive Sync to Dexie IndexedDB
  useEffect(() => {
    if (isDbReady && settings) {
      db.settings.put({ id: 'active_settings', ...settings }).catch(() => {});
    }
  }, [settings, isDbReady]);

  useEffect(() => {
    if (isDbReady && shops?.length) {
      db.shops.bulkPut(shops).catch(() => {});
    }
  }, [shops, isDbReady]);

  useEffect(() => {
    if (isDbReady && tables?.length) {
      db.diningTables.bulkPut(tables).catch(() => {});
    }
  }, [tables, isDbReady]);

  useEffect(() => {
    if (isDbReady && products?.length) {
      db.products.bulkPut(products).catch(() => {});
    }
  }, [products, isDbReady]);

  useEffect(() => {
    if (isDbReady && rawMaterials?.length) {
      db.rawMaterials.bulkPut(rawMaterials).catch(() => {});
    }
  }, [rawMaterials, isDbReady]);

  useEffect(() => {
    if (isDbReady) {
      db.customers.clear().then(() => {
        if (customers.length > 0) db.customers.bulkPut(customers);
      }).catch(() => {});
    }
  }, [customers, isDbReady]);

  useEffect(() => {
    if (isDbReady) {
      db.suppliers.clear().then(() => {
        if (suppliers.length > 0) db.suppliers.bulkPut(suppliers);
      }).catch(() => {});
    }
  }, [suppliers, isDbReady]);

  useEffect(() => {
    if (isDbReady) {
      db.purchases.clear().then(() => {
        if (purchases.length > 0) db.purchases.bulkPut(purchases);
      }).catch(() => {});
    }
  }, [purchases, isDbReady]);

  useEffect(() => {
    if (isDbReady) {
      db.expenses.clear().then(() => {
        if (expenses.length > 0) db.expenses.bulkPut(expenses);
      }).catch(() => {});
    }
  }, [expenses, isDbReady]);

  useEffect(() => {
    if (isDbReady && staff?.length) {
      db.staff.bulkPut(staff).catch(() => {});
    }
  }, [staff, isDbReady]);

  // Real-Time Firebase Listeners for Multi-Device & Mobile Sync
  useEffect(() => {
    if (isFirebaseSyncActive) {
      console.log('[Firebase Cloud] Attaching real-time cloud listeners...');
      const unsubOrders = subscribeToFirebaseOrders((cloudOrders) => {
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }
      });
      const unsubShops = subscribeToFirebaseShops((cloudShops) => {
        if (cloudShops && cloudShops.length > 0) {
          setShops(cloudShops);
        }
      });
      const unsubStaff = subscribeToFirebaseStaff((cloudStaff) => {
        if (cloudStaff && cloudStaff.length > 0) {
          setStaff(cloudStaff);
        }
      });

      return () => {
        unsubOrders();
        unsubShops();
        unsubStaff();
      };
    }
  }, [isFirebaseSyncActive]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Operations
  const login = (staffMember) => {
    setCurrentUser(staffMember);
    if (staffMember.role === 'STAFF' && staffMember.shopId) {
      setActiveShopId(staffMember.shopId);
      setActiveView('pos'); // Jump straight into Billing
    } else {
      setActiveShopId('all');
      setActiveView('owner'); // Jump straight into Owner Hub
    }
    showToast(`Welcome back, ${staffMember.name}!`);
    playSound('beep', settings.audioBeepsEnabled);
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    showToast('Logged out successfully');
  };

  // Shop Switcher & Multi-Shop Operations
  const switchShop = (shopId) => {
    if (currentUser?.role === 'STAFF' && currentUser.shopId && currentUser.shopId !== shopId) {
      showToast('Staff are restricted to their assigned outlet', 'warning');
      return;
    }
    setActiveShopId(shopId);
    const targetShop = shops.find(s => s.id === shopId);
    if (shopId === 'all') {
      showToast('Switched to Enterprise Consolidated View (All Shops)');
    } else {
      showToast(`Switched outlet to: ${targetShop ? targetShop.name : shopId}`);
    }
    playSound('beep', settings.audioBeepsEnabled);
  };

  const createShop = async (shopData) => {
    const newShopId = 'shop-' + Date.now();
    const newShop = {
      id: newShopId,
      name: shopData.name,
      code: shopData.code || `BLR-${Math.floor(100 + Math.random() * 900)}`,
      address: shopData.address || '',
      city: shopData.city || 'Bengaluru',
      state: shopData.state || 'Karnataka',
      pincode: shopData.pincode || '560001',
      phone: shopData.phone || settings.phone,
      gstin: shopData.gstin || settings.gstin,
      createdAt: new Date().toISOString(),
      isActive: true,
      isPrimary: false
    };

    // Create 6 default tables for this new shop
    const newShopTables = [1, 2, 3, 4, 5, 6].map(num => ({
      id: `T-${newShop.code}-${num < 10 ? '0' + num : num}`,
      shopId: newShopId,
      name: `Table ${num}`,
      floor: 'Main Floor',
      seats: num % 2 === 0 ? 4 : 2,
      status: 'Available'
    }));

    const updatedShops = [...shops, newShop];
    const updatedTables = [...tables, ...newShopTables];

    setShops(updatedShops);
    setTables(updatedTables);

    try {
      await db.shops.put(newShop);
      await db.diningTables.bulkPut(newShopTables);
      if (isFirebaseSyncActive) {
        syncShopToFirebase(newShop);
      }
    } catch (e) {
      console.error('Error saving new shop to DB', e);
    }

    showToast(`New shop "${newShop.name}" created with 6 tables!`);
    setActiveShopId(newShopId);
  };

  const activeShop = shops.find(s => s.id === activeShopId) || (activeShopId === 'all' ? { id: 'all', name: 'All Shops (Consolidated)' } : null);

  // Scoped Data getters
  const scopedOrders = (activeShopId === 'all')
    ? orders
    : orders.filter(o => o.shopId === activeShopId || !o.shopId);

  const scopedTables = (activeShopId === 'all')
    ? tables
    : tables.filter(t => t.shopId === activeShopId || !t.shopId);

  const scopedStaff = (activeShopId === 'all')
    ? staff
    : staff.filter(s => s.shopId === activeShopId || s.role === 'OWNER');

  const scopedExpenses = (activeShopId === 'all')
    ? expenses
    : expenses.filter(e => e.shopId === activeShopId || !e.shopId);

  // Keyboard shortcut listener (Billing shortcuts reserved for Staff)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          setActiveModal(null);
        }
        return;
      }

      if (e.key === 'Escape') {
        setActiveModal(null);
        setIsMobileCartOpen(false);
        setIsMobileMenuOpen(false);
        return;
      }

      // POS shortcuts only available for Staff
      if (currentUser?.role === 'OWNER') return;

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, currentUser]);

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
    if (currentUser?.role === 'OWNER') {
      showToast('Owner cannot make bills. Only staff can create orders.', 'warning');
      return;
    }
    triggerAudio('beep');
    const addonPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const basePrice = variant ? variant.price : product.price;
    const finalPrice = basePrice + addonPrice;

    // Check duplicate
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

  // Complete Order with Multi-Shop Association & ACID Dexie Transaction
  const completePayment = async (paymentMethod = 'UPI', amountReceived = null, referenceNo = '') => {
    if (currentUser?.role === 'OWNER') {
      showToast('Owner cannot make bills. Only staff can create invoices.', 'error');
      return;
    }
    if (cart.length === 0) return;

    // Resolve which shop this bill belongs to
    const targetShopId = (activeShopId !== 'all') ? activeShopId : (currentUser?.shopId || shops[0]?.id || 'shop-1');
    const targetShopObj = shops.find(s => s.id === targetShopId) || shops[0];

    // Generate Invoice Number
    const nextOrderNum = orders.length + 1001;
    const prefix = targetShopObj?.code ? `${targetShopObj.code}-` : settings.invoicePrefix;
    const invoiceNo = `${prefix}${nextOrderNum}`;
    const tokenNo = (orders.length % 99) + 101;

    const newOrder = {
      id: `ord-${Date.now()}`,
      shopId: targetShopId,
      shopName: targetShopObj?.name || settings.brandName,
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
      cashierName: currentUser ? currentUser.name : `${settings.ownerName} (Owner)`
    };

    // Calculate BOM Deductions
    const rawDeductions = [];
    const newAuditEntries = [];
    let updatedRaw = [...rawMaterials];

    if (settings.autoBOMDeduction) {
      cart.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.productId);
        if (prod && prod.bom && prod.bom.length > 0) {
          prod.bom.forEach(bomItem => {
            const deductQty = bomItem.qty * cartItem.quantity;
            rawDeductions.push({
              rawId: bomItem.rawId,
              deductQty,
              unit: bomItem.unit
            });

            const rawIdx = updatedRaw.findIndex(r => r.id === bomItem.rawId);
            if (rawIdx > -1) {
              const prev = updatedRaw[rawIdx].currentStock;
              const next = Math.max(0, Number((prev - deductQty).toFixed(3)));
              updatedRaw[rawIdx] = {
                ...updatedRaw[rawIdx],
                currentStock: next,
                status: next <= updatedRaw[rawIdx].minThreshold ? 'Low Stock' : 'Sufficient'
              };

              newAuditEntries.push({
                id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                shopId: targetShopId,
                timestamp: new Date().toLocaleString(),
                type: 'Recipe Deduction',
                itemType: 'Raw Material',
                changeQty: `-${deductQty} ${bomItem.unit}`,
                previousStock: `${prev} ${bomItem.unit}`,
                newStock: `${next} ${bomItem.unit}`,
                notes: `Order ${invoiceNo}: ${cartItem.quantity}x ${cartItem.name} auto-deduction`,
                user: currentUser ? currentUser.name : settings.ownerName
              });
            }
          });
        }
      });
    }

    // Customer CRM Update
    let customerUpdate = null;
    if (selectedCustomer) {
      const updatedSpend = Number((selectedCustomer.totalSpent + cartTotal).toFixed(2));
      const updatedVisits = selectedCustomer.ordersCount + 1;
      customerUpdate = {
        ...selectedCustomer,
        ordersCount: updatedVisits,
        totalSpent: updatedSpend,
        avgOrderValue: Number((updatedSpend / updatedVisits).toFixed(1))
      };
    }

    // Table Update
    const tableUpdate = (selectedTable && orderChannel === 'Dine-In')
      ? { id: selectedTable.id, status: 'Occupied' }
      : null;

    // Execute ACID Dexie Transaction
    try {
      await executeOrderTransaction({
        order: newOrder,
        rawDeductions,
        auditLogs: newAuditEntries,
        customerUpdate,
        tableUpdate
      });

      // Update in-memory state
      setOrders([newOrder, ...orders]);
      if (settings.autoBOMDeduction) {
        setRawMaterials(updatedRaw);
        if (newAuditEntries.length > 0) {
          setAuditLogs(prev => [...newAuditEntries, ...prev]);
        }
      }
      if (customerUpdate) {
        setCustomers(prev => prev.map(c => c.id === customerUpdate.id ? customerUpdate : c));
      }
      if (tableUpdate) {
        setTables(prev => prev.map(t => t.id === tableUpdate.id ? { ...t, status: 'Occupied' } : t));
      }
    } catch (err) {
      console.error('[Dexie IndexedDB] Order transaction fallback:', err);
      setOrders([newOrder, ...orders]);
    }

    // Audio & Confetti
    triggerAudio('checkout');
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Cloud Sync to Firebase Firestore if connected
    if (isFirebaseSyncActive) {
      syncOrderToFirebase(newOrder);
    }

    // Reset Cart
    clearCart();
    setIsMobileCartOpen(false);

    // Show Receipt Modal for this new order
    openModal('receipt', newOrder);
    showToast(`Order ${invoiceNo} saved for ${targetShopObj?.name || 'Shop'}!`);
  };

  // Reset to Clean Production State (Zero Mock Data)
  const resetDemoData = async () => {
    try {
      await resetDatabaseToCleanProduction();
      setSettings(initialSettings);
      setShops(initialShops);
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
      showToast('Database reset to clean production state (Zero Mock Data)!');
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Failed to reset database', 'error');
    }
  };

  // Export Database JSON from IndexedDB
  const exportDatabase = async () => {
    try {
      const data = await exportDatabaseJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brew-bite-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Multi-Outlet database backup JSON downloaded!');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed', 'error');
    }
  };

  // Import Database JSON into IndexedDB
  const importDatabase = async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      await importDatabaseJSON(parsed);
      
      // Refresh memory state
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.shops) setShops(parsed.shops);
      if (parsed.tables) setTables(parsed.tables);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.rawMaterials) setRawMaterials(parsed.rawMaterials);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.staff) setStaff(parsed.staff);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);

      showToast('IndexedDB restored from backup successfully!');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Failed to import database file: ' + err.message, 'error');
    }
  };

  // Menu items cannot be deleted or managed by Owner
  const deleteProduct = () => {
    showToast('Menu items are protected and cannot be deleted', 'warning');
  };

  const updateProducts = (val) => {
    if (currentUser?.role === 'OWNER') {
      showToast('Owner cannot manage menu items.', 'warning');
      return;
    }
    setProducts(val);
  };

  // Raw Material Stock Adjust with DB write
  const adjustRawStock = async (rawId, changeQty, reason = 'Manual audit adjustment') => {
    const raw = rawMaterials.find(r => r.id === rawId);
    if (!raw) return;
    const prev = raw.currentStock;
    const next = Math.max(0, Number((prev + changeQty).toFixed(3)));
    const newStatus = next <= raw.minThreshold ? 'Low Stock' : 'Sufficient';

    const logEntry = {
      id: 'log-' + Date.now(),
      shopId: activeShopId !== 'all' ? activeShopId : (shops[0]?.id || 'shop-1'),
      timestamp: new Date().toLocaleString(),
      type: changeQty >= 0 ? 'Stock Addition' : 'Manual Audit',
      itemType: 'Raw Material',
      changeQty: `${changeQty >= 0 ? '+' : ''}${changeQty} ${raw.unit}`,
      previousStock: `${prev} ${raw.unit}`,
      newStock: `${next} ${raw.unit}`,
      notes: reason,
      user: currentUser ? currentUser.name : settings.ownerName
    };

    try {
      await db.transaction('rw', [db.rawMaterials, db.auditLogs], async () => {
        await db.rawMaterials.update(rawId, {
          currentStock: next,
          status: newStatus
        });
        await db.auditLogs.put(logEntry);
      });
    } catch (err) {
      console.error('Stock adjust DB error:', err);
    }

    setRawMaterials(prevList => prevList.map(r => {
      if (r.id === rawId) {
        return { ...r, currentStock: next, status: newStatus };
      }
      return r;
    }));

    setAuditLogs(prev => [logEntry, ...prev]);
    showToast(`Stock updated for ${raw.name}`);
  };

  // Update Settings in DB
  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await db.settings.put({ id: 'active_settings', ...newSettings });
      showToast('Settings saved to database');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,

        // Shops
        shops,
        setShops,
        activeShopId,
        activeShop,
        switchShop,
        createShop,

        isDbReady,
        dbName,
        firebaseConfig,
        isFirebaseSyncActive,
        updateFirebaseConfig,
        settings,
        setSettings: updateSettings,
        tables,
        setTables,
        categories: initialCategories,
        products,
        setProducts: updateProducts,
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

        // Scoped Data
        scopedOrders,
        scopedTables,
        scopedStaff,
        scopedExpenses,

        activeView,
        setActiveView,
        activeModal,
        openModal,
        closeModal,
        modalData,
        toast,
        showToast,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileCartOpen,
        setIsMobileCartOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,

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
        importDatabase,
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
