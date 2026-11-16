import {
  collection, doc, getDocFromServer, getDocsFromServer, onSnapshot,
  runTransaction, writeBatch, query, where
} from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { brandingRef } from '../services/branding';
import { newId } from '../domain/ids';
import { normalizePhone } from '../domain/customers';
import { mergeSavedAddons } from '../domain/addons';
import { mergeSavedCategories } from '../domain/categories';
import { stores, validateBackup } from './backup';
import {
  initialSettings, initialTables, initialProducts,
  initialCustomers, initialOrders, initialSuppliers, initialPurchases,
  initialExpenses, initialStaff, initialAuditLogs
} from '../data/initialData';

const seed = {
  settings: initialSettings, tables: initialTables, products: initialProducts,
  rawMaterials: [], customers: initialCustomers, orders: initialOrders,
  suppliers: initialSuppliers, purchases: initialPurchases, expenses: initialExpenses,
  staff: initialStaff.map(({ pin, ...row }) => row), auditLogs: initialAuditLogs
};

export const workspaceRef = doc(firestore, 'posConfig', 'current');
const store = (workspace, name) => collection(firestore, 'posWorkspaces', workspace, name);
const row = (workspace, name, id) => doc(store(workspace, name), id);
const config = workspace => row(workspace, 'config', 'settings');
const sequence = workspace => row(workspace, 'config', 'invoiceSequence');

export function watchConfig(workspace, next, error) {
  return onSnapshot(config(workspace), { includeMetadataChanges: true }, snapshot => {
    if (snapshot.metadata.hasPendingWrites) return;
    if (!snapshot.exists()) {
      error(new Error('The active workspace has no settings.'));
      return;
    }
    next({ ...initialSettings, ...snapshot.data() });
  }, error);
}

export function watchRows(workspace, name, next, error, recordedBy) {
  const records = store(workspace, name);
  const source = recordedBy ? query(records, where('recordedBy', '==', recordedBy)) : records;
  return onSnapshot(source, { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
  }, error);
}

const idKey = value => encodeURIComponent(value.trim().toLowerCase());
const identityFor = {
  products: record => [['sku', record?.sku], ['barcode', record?.barcode]],
  customers: record => [['phone', record && normalizePhone(record.phone)]]
};

function identityRefs(workspace, name, record) {
  return (identityFor[name]?.(record) ?? [])
    .filter(([, value]) => value)
    .map(([field, value]) => row(workspace, 'identity', `${name}-${field}-${idKey(value)}`));
}

function sequenceFor(data) {
  const imported = (data.sequences ?? []).map(entry => entry.next);
  const invoices = data.orders.map(order => Number(order.invoiceNo.match(/\d+$/)?.[0] || 0));
  // Match the configured prefix exactly when it ends in a digit.
  if (/\d$/.test(data.settings.invoicePrefix ?? '')) {
    for (const order of data.orders) {
      if (!order.invoiceNo.startsWith(data.settings.invoicePrefix)) continue;
      const suffix = order.invoiceNo.slice(data.settings.invoicePrefix.length);
      if (/^\d+$/.test(suffix)) invoices.push(Number(suffix));
    }
  }
  const next = invoices.filter(Number.isSafeInteger).reduce((highest, value) => Math.max(highest, value + 1), 1);
  return imported.reduce((highest, value) => Math.max(highest, value), next);
}

function cleanStaff({ pin, ...record }) {
  return record;
}

async function stageWorkspace(workspace, data) {
  const writes = [[config(workspace), { ...initialSettings, ...data.settings, id: 'active_settings' }]];
  writes.push([sequence(workspace), { next: sequenceFor(data), count: data.orders.length }]);
  const identities = new Map();

  for (const name of stores) {
    for (const source of data[name]) {
      const record = name === 'staff' ? cleanStaff(source) : source;
      writes.push([row(workspace, name, record.id), record]);
      for (const key of identityRefs(workspace, name, record)) {
        const current = identities.get(key.path);
        identities.set(key.path, [key, { id: current ? '__duplicate__' : record.id }]);
      }
    }
  }
  writes.push(...identities.values());
  for (let offset = 0; offset < writes.length; offset += 400) {
    const batch = writeBatch(firestore);
    for (const [ref, value] of writes.slice(offset, offset + 400)) batch.set(ref, value);
    await batch.commit();
  }
}

export async function initializeWorkspace() {
  const existing = await getDocFromServer(workspaceRef);
  if (existing.exists()) return;
  const workspace = newId();
  await stageWorkspace(workspace, seed);
  await runTransaction(firestore, async transaction => {
    if ((await transaction.get(workspaceRef)).exists()) return;
    transaction.set(workspaceRef, { workspace });
    transaction.set(brandingRef, { brandName: initialSettings.brandName });
  });
}

export async function exportDatabaseJSON(workspace) {
  // Keep exports scoped to a single workspace even if it is switched during the read.
  const before = await getDocFromServer(workspaceRef);
  if (before.data()?.workspace !== workspace) throw new Error('Workspace changed. Reopen settings and retry.');
  async function readAll() {
    const [results, settings, next] = await Promise.all([
      Promise.all(stores.map(async name => {
        const snapshot = await getDocsFromServer(store(workspace, name));
        return [name, snapshot.docs.map(item => item.data())];
      })),
      getDocFromServer(config(workspace)), getDocFromServer(sequence(workspace))
    ]);
    return { rows: Object.fromEntries(results), settings: settings.data(), next: next.data()?.next ?? 1 };
  }
  const snapshot = await readAll();
  const confirmation = await readAll();
  const after = await getDocFromServer(workspaceRef);
  if (after.data()?.workspace !== workspace || JSON.stringify(snapshot) !== JSON.stringify(confirmation)) {
    throw new Error('Records changed during export. Pause edits briefly and retry.');
  }
  return {
    database: 'BrewBitePOS_DB_v2', version: 1, exportedAt: new Date().toISOString(),
    settings: snapshot.settings, ...snapshot.rows,
    sequences: [{ id: 'cloud', next: snapshot.next }]
  };
}

async function replaceWorkspace(workspace, data) {
  const replacement = newId();
  await stageWorkspace(replacement, data);
  await runTransaction(firestore, async transaction => {
    const active = await transaction.get(workspaceRef);
    const oldSequence = await transaction.get(sequence(workspace));
    const newSequence = await transaction.get(sequence(replacement));
    if (active.data()?.workspace !== workspace) throw new Error('Workspace changed during restore. Retry.');
    transaction.update(sequence(replacement), {
      next: Math.max(oldSequence.data()?.next ?? 1, newSequence.data().next)
    });
    transaction.set(workspaceRef, { workspace: replacement });
    transaction.set(brandingRef, { brandName: data.settings.brandName ?? initialSettings.brandName });
  });
}

export const importDatabaseJSON = (workspace, data) => replaceWorkspace(workspace, validateBackup(data));
export const resetDatabaseToCleanProduction = workspace => replaceWorkspace(workspace, seed);

export const draftRevision = draft => draft?.revision ?? draft?.updatedAt ?? null;

export function saveTableDraft(workspace, tableId, expectedRevision, draft) {
  const ref = row(workspace, 'tables', tableId);
  return runTransaction(firestore, async transaction => {
    const table = (await transaction.get(ref)).data();
    if (!table || draftRevision(table.activeOrder) !== expectedRevision) {
      throw new Error('This table changed in another window. Review the current order and try again.');
    }
    transaction.update(ref, {
      reserved: false,
      status: draft?.items.length ? 'Occupied' : 'Available',
      currentOrderTotal: draft?.total ?? 0,
      activeOrder: draft
    });
  });
}

export function deleteTable(workspace, id) {
  const ref = row(workspace, 'tables', id);
  return runTransaction(firestore, async transaction => {
    const table = (await transaction.get(ref)).data();
    if (table?.activeOrder?.items.length) throw new Error('Clear or settle this table’s order first.');
    transaction.delete(ref);
  });
}

export function createTable(workspace, fields) {
  const table = { ...fields, id: newId() };
  const ref = row(workspace, 'tables', table.id);
  return runTransaction(firestore, async transaction => {
    const current = await transaction.get(ref);
    if (current.exists()) throw new Error('Could not create the table. Try again.');
    transaction.set(ref, table);
  });
}

export function syncPublicBrand(workspace) {
  return runTransaction(firestore, async transaction => {
    const active = await transaction.get(workspaceRef);
    if (active.data()?.workspace !== workspace) return;
    const settings = await transaction.get(config(workspace));
    const branding = await transaction.get(brandingRef);
    const brandName = settings.data()?.brandName;
    if (typeof brandName === 'string' && branding.data()?.brandName !== brandName) {
      transaction.set(brandingRef, { brandName });
    }
  });
}

export function updateSettings(workspace, changes) {
  const ref = config(workspace);
  return runTransaction(firestore, async transaction => {
    if (!Object.hasOwn(changes, 'brandName')) {
      await transaction.get(ref);
      transaction.update(ref, changes);
      return;
    }

    const active = await transaction.get(workspaceRef);
    if (active.data()?.workspace !== workspace) {
      throw new Error('Workspace changed. Review settings and try again.');
    }
    const brandName = changes.brandName.trim();
    transaction.update(ref, { ...changes, brandName });
    transaction.set(brandingRef, { brandName });
  });
}

export function createExpense(workspace, expense) {
  return runTransaction(firestore, async transaction => {
    transaction.set(row(workspace, 'expenses', expense.id), expense);
  });
}

export function deleteRecord(workspace, name, id) {
  const ref = row(workspace, name, id);
  return runTransaction(firestore, async transaction => {
    await transaction.get(ref);
    transaction.delete(ref);
  });
}

export function saveUniqueRecord(workspace, name, record) {
  const ref = row(workspace, name, record.id);
  return runTransaction(firestore, async transaction => {
    const old = (await transaction.get(ref)).data();
    const previous = identityRefs(workspace, name, old);
    const keys = identityRefs(workspace, name, record);
    const added = keys.filter(key => !previous.some(item => item.path === key.path));
    const removed = previous.filter(key => !keys.some(item => item.path === key.path));
    const checks = await Promise.all([...added, ...removed].map(key => transaction.get(key)));
    if (checks.slice(0, added.length).some(key => key.exists() && key.data().id !== record.id)) {
      throw new Error(name === 'products' ? 'Another product uses this SKU or barcode.' : 'A customer already uses this number.');
    }

    const cleanCat = (name === 'products' && typeof record.category === 'string') ? record.category.trim() : '';
    const hasAddonUpdates = (name === 'products' && record.hasAddons && record.addons?.length);
    const settingsRef = (hasAddonUpdates || cleanCat) ? config(workspace) : null;
    const settingsSnap = settingsRef ? await transaction.get(settingsRef) : null;
    const settingsData = settingsSnap?.data();

    const settingsUpdates = {};
    if (hasAddonUpdates) {
      const saved = mergeSavedAddons(settingsData?.commonAddons);
      const merged = mergeSavedAddons(saved, record.addons);
      if (merged.length > saved.length) settingsUpdates.commonAddons = merged;
    }

    if (cleanCat) {
      const saved = mergeSavedCategories(settingsData?.commonCategories || settingsData?.categories);
      const merged = mergeSavedCategories(saved, [cleanCat]);
      if (merged.length > saved.length) {
        settingsUpdates.commonCategories = merged;
        settingsUpdates.categories = merged;
      }
    }

    if (settingsRef && Object.keys(settingsUpdates).length > 0) {
      transaction.update(settingsRef, settingsUpdates);
    }

    const defaults = name === 'customers' ? { ordersCount: 0, totalSpent: 0, avgOrderValue: 0 } : {};
    transaction.set(ref, { ...defaults, ...old, ...record });
    added.forEach(key => transaction.set(key, { id: record.id }));
    removed.forEach((key, index) => {
      if (checks[added.length + index].data()?.id === record.id) transaction.delete(key);
    });
  });
}

export function deleteUniqueRecord(workspace, name, id) {
  const ref = row(workspace, name, id);
  return runTransaction(firestore, async transaction => {
    const old = (await transaction.get(ref)).data();
    const keys = identityRefs(workspace, name, old);
    const checks = await Promise.all(keys.map(key => transaction.get(key)));
    keys.forEach((key, index) => {
      if (checks[index].data()?.id === id) transaction.delete(key);
    });
    transaction.delete(ref);
  });
}

export async function executeOrderTransaction(workspace, { order, tableRevision, customerId }) {
  const orderRef = row(workspace, 'orders', order.id);
  const tableRef = order.tableId ? row(workspace, 'tables', order.tableId) : null;
  const customerRef = customerId ? row(workspace, 'customers', customerId) : null;
  const sequenceRef = sequence(workspace);

  let observedSequence;
  const settle = () => runTransaction(firestore, async transaction => {
    const existing = (await transaction.get(orderRef)).data();
    if (existing) {
      if (existing.draftRevision !== order.draftRevision || existing.cashierUid !== order.cashierUid ||
          existing.paymentMethod !== order.paymentMethod || existing.amountReceived !== order.amountReceived ||
          existing.referenceNo !== order.referenceNo ||
          existing.splitBreakdown?.cash !== order.splitBreakdown?.cash ||
          existing.splitBreakdown?.upi !== order.splitBreakdown?.upi) {
        throw new Error('This bill was already settled. Review its receipt before handling any further payment.');
      }
      return existing;
    }
    const [current, settings, table, customer, active] = await Promise.all([
      transaction.get(sequenceRef).then(result => result.data()),
      transaction.get(config(workspace)).then(result => result.data()),
      tableRef && transaction.get(tableRef).then(result => result.data()),
      customerRef && transaction.get(customerRef).then(result => result.data()),
      transaction.get(workspaceRef).then(result => result.data())
    ]);
    observedSequence = current?.next;
    if (active?.workspace !== workspace || !settings) {
      throw new Error('The active workspace changed. Review the bill before settling.');
    }
    if (tableRef && (!table?.activeOrder || draftRevision(table.activeOrder) !== tableRevision)) {
      throw new Error('The table order changed. Review the current bill before completing payment.');
    }
    const startingNumber = settings.startingNumber ?? 1001;
    const suffix = Math.max(current.next, startingNumber);
    if (!Number.isSafeInteger(suffix) || suffix >= Number.MAX_SAFE_INTEGER) throw new Error('Invoice sequence exhausted.');

    const saved = {
      ...order, invoiceNo: (settings.invoicePrefix || initialSettings.invoicePrefix) + suffix,
      invoiceSequence: suffix, tokenNo: (current.count % 99) + 101
    };
    transaction.set(orderRef, saved);
    transaction.update(sequenceRef, { next: suffix + 1, count: current.count + 1, lastOrderId: saved.id });

    if (customer) {
      const ordersCount = (Number(customer.ordersCount) || 0) + 1;
      const totalSpent = Number(((Number(customer.totalSpent) || 0) + saved.total).toFixed(2));
      transaction.update(customerRef, { ordersCount, totalSpent, avgOrderValue: Number((totalSpent / ordersCount).toFixed(1)) });
    }
    if (tableRef) {
      transaction.update(tableRef, { status: 'Available', reserved: false, currentOrderTotal: 0, activeOrder: null });
    }
    return saved;
  });

  for (let attempt = 0; ; attempt++) {
    try {
      return await settle();
    } catch (error) {
      if (error.code !== 'permission-denied' || attempt === 2 || observedSequence === undefined) throw error;
      // A simultaneous settlement can make sequence-dependent rules reject
      // before Firestore reports the transaction conflict.
      const latest = (await getDocFromServer(sequenceRef)).data();
      if (latest?.next === observedSequence) throw error;
    }
  }
}

export function refundOrder(workspace, order, refund) {
  const ref = row(workspace, 'orders', order.id);
  return runTransaction(firestore, async transaction => {
    const current = (await transaction.get(ref)).data();
    const settings = (await transaction.get(config(workspace))).data();
    if (!settings?.allowStaffRefunds) throw new Error('Ask the owner to enable recording refunds.');
    if (!current || current.status !== 'Completed' || current.refund) {
      throw new Error('This invoice is unavailable or already refunded.');
    }
    transaction.update(ref, { refund: { ...refund, amount: current.total } });
  });
}
