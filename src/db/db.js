import Dexie from 'dexie';
import {
  initialSettings,
  initialTables,
  initialProducts,
  initialRawMaterials,
  initialCustomers,
  initialOrders,
  initialSuppliers,
  initialPurchases,
  initialExpenses,
  initialStaff,
  initialAuditLogs
} from '../data/initialData';

// Initialize Dexie Database
export const db = new Dexie('CaffeFlowPOS_DB');

// Define database schema
db.version(1).stores({
  settings: 'id',
  tables: 'id, status, floor, seats',
  products: 'id, category, sku, barcode, name, price',
  rawMaterials: 'id, code, category, status, currentStock',
  customers: 'id, phone, name, ordersCount, totalSpent',
  orders: 'id, invoiceNo, tokenNo, createdAt, channel, tableId, status, paymentMethod, total',
  suppliers: 'id, name, phone, gstNumber',
  purchases: 'id, poNumber, invoiceNo, supplierId, date, paymentStatus',
  expenses: 'id, category, date, paymentMethod, amount',
  staff: 'id, role, pin, status',
  auditLogs: 'id, timestamp, type, itemType'
});

// Enable browser persistent storage permission
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const granted = await navigator.storage.persist();
      console.log(`[IndexedDB Storage] Persistent storage granted: ${granted}`);
      return granted;
    }
    return isPersisted;
  }
  return false;
}

// Initialize database with seed data if fresh
export async function initializeDatabase() {
  try {
    await requestPersistentStorage();

    // Check if settings table already has records
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      console.log('[IndexedDB Storage] Seeding fresh database with clean production master data...');
      
      await db.transaction('rw', [
        db.settings,
        db.tables,
        db.products,
        db.rawMaterials,
        db.customers,
        db.orders,
        db.suppliers,
        db.purchases,
        db.expenses,
        db.staff,
        db.auditLogs
      ], async () => {
        // Seed Master Config
        await db.settings.put({ id: 'active_settings', ...initialSettings });
        
        // Seed Master Tables & Products & Raw Materials & Staff
        await db.tables.bulkPut(initialTables);
        await db.products.bulkPut(initialProducts);
        await db.rawMaterials.bulkPut(initialRawMaterials);
        await db.staff.bulkPut(initialStaff);

        // Transactional collections remain strictly empty (zero mock data)
        if (initialCustomers.length > 0) await db.customers.bulkPut(initialCustomers);
        if (initialOrders.length > 0) await db.orders.bulkPut(initialOrders);
        if (initialSuppliers.length > 0) await db.suppliers.bulkPut(initialSuppliers);
        if (initialPurchases.length > 0) await db.purchases.bulkPut(initialPurchases);
        if (initialExpenses.length > 0) await db.expenses.bulkPut(initialExpenses);
        if (initialAuditLogs.length > 0) await db.auditLogs.bulkPut(initialAuditLogs);
      });
      console.log('[IndexedDB Storage] Database initialized successfully!');
    }
  } catch (err) {
    console.error('[IndexedDB Storage] Error initializing Dexie database:', err);
  }
}

// Atomically save an order with recipe BOM inventory deduction and audit logging
export async function executeOrderTransaction({
  order,
  rawDeductions = [],
  auditLogs = [],
  customerUpdate = null,
  tableUpdate = null
}) {
  return await db.transaction('rw', [
    db.orders,
    db.rawMaterials,
    db.auditLogs,
    db.customers,
    db.tables
  ], async () => {
    // 1. Put order
    await db.orders.put(order);

    // 2. Deduct BOM raw materials
    for (const deduction of rawDeductions) {
      const existing = await db.rawMaterials.get(deduction.rawId);
      if (existing) {
        const nextStock = Math.max(0, Number((existing.currentStock - deduction.deductQty).toFixed(3)));
        await db.rawMaterials.update(deduction.rawId, {
          currentStock: nextStock,
          status: nextStock <= existing.minThreshold ? 'Low Stock' : 'Sufficient'
        });
      }
    }

    // 3. Save audit log entries
    if (auditLogs.length > 0) {
      await db.auditLogs.bulkPut(auditLogs);
    }

    // 4. Update customer CRM stats
    if (customerUpdate) {
      await db.customers.put(customerUpdate);
    }

    // 5. Update table status
    if (tableUpdate) {
      await db.tables.update(tableUpdate.id, { status: tableUpdate.status });
    }

    return order;
  });
}

// Export complete IndexedDB database snapshot as JSON
export async function exportDatabaseJSON() {
  const [
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
    auditLogs
  ] = await Promise.all([
    db.settings.toArray(),
    db.tables.toArray(),
    db.products.toArray(),
    db.rawMaterials.toArray(),
    db.customers.toArray(),
    db.orders.toArray(),
    db.suppliers.toArray(),
    db.purchases.toArray(),
    db.expenses.toArray(),
    db.staff.toArray(),
    db.auditLogs.toArray()
  ]);

  return {
    database: 'CaffeFlowPOS_DB',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settings[0] || initialSettings,
    tables,
    products,
    rawMaterials,
    customers,
    orders,
    suppliers,
    purchases,
    expenses,
    staff,
    auditLogs
  };
}

// Import database from JSON snapshot
export async function importDatabaseJSON(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');

  await db.transaction('rw', [
    db.settings,
    db.tables,
    db.products,
    db.rawMaterials,
    db.customers,
    db.orders,
    db.suppliers,
    db.purchases,
    db.expenses,
    db.staff,
    db.auditLogs
  ], async () => {
    if (data.settings) await db.settings.put({ id: 'active_settings', ...data.settings });
    if (data.tables) { await db.tables.clear(); await db.tables.bulkPut(data.tables); }
    if (data.products) { await db.products.clear(); await db.products.bulkPut(data.products); }
    if (data.rawMaterials) { await db.rawMaterials.clear(); await db.rawMaterials.bulkPut(data.rawMaterials); }
    if (data.customers) { await db.customers.clear(); if (data.customers.length) await db.customers.bulkPut(data.customers); }
    if (data.orders) { await db.orders.clear(); if (data.orders.length) await db.orders.bulkPut(data.orders); }
    if (data.suppliers) { await db.suppliers.clear(); if (data.suppliers.length) await db.suppliers.bulkPut(data.suppliers); }
    if (data.purchases) { await db.purchases.clear(); if (data.purchases.length) await db.purchases.bulkPut(data.purchases); }
    if (data.expenses) { await db.expenses.clear(); if (data.expenses.length) await db.expenses.bulkPut(data.expenses); }
    if (data.staff) { await db.staff.clear(); if (data.staff.length) await db.staff.bulkPut(data.staff); }
    if (data.auditLogs) { await db.auditLogs.clear(); if (data.auditLogs.length) await db.auditLogs.bulkPut(data.auditLogs); }
  });

  return true;
}

// Reset transactional data to clean production state
export async function resetDatabaseToCleanProduction() {
  await db.transaction('rw', [
    db.settings,
    db.tables,
    db.products,
    db.rawMaterials,
    db.customers,
    db.orders,
    db.suppliers,
    db.purchases,
    db.expenses,
    db.staff,
    db.auditLogs
  ], async () => {
    await db.settings.put({ id: 'active_settings', ...initialSettings });
    await db.tables.clear();
    await db.tables.bulkPut(initialTables);
    await db.products.clear();
    await db.products.bulkPut(initialProducts);
    await db.rawMaterials.clear();
    await db.rawMaterials.bulkPut(initialRawMaterials);
    await db.staff.clear();
    await db.staff.bulkPut(initialStaff);

    // Empty transactional tables
    await db.customers.clear();
    await db.orders.clear();
    await db.suppliers.clear();
    await db.purchases.clear();
    await db.expenses.clear();
    await db.auditLogs.clear();
  });
}
