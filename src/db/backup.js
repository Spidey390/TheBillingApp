import { isUpiQrImage } from '../domain/upi.js';

export const stores = [
  'tables', 'products', 'rawMaterials', 'customers', 'orders',
  'suppliers', 'purchases', 'expenses', 'staff', 'auditLogs'
];

const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
const isMoney = value => typeof value === 'number' && Number.isFinite(value);
const isText = value => typeof value === 'string';
const validLine = item => isRecord(item) && isText(item.name) && isMoney(item.price) &&
  Number.isInteger(item.quantity) && item.quantity > 0 && (!item.addons || Array.isArray(item.addons));

const checkRow = {
  products: row => isText(row.name) && isMoney(row.price) && (!row.sizes ||
    (Array.isArray(row.sizes) && row.sizes.every(size => isRecord(size) && isText(size.name) && isMoney(size.price)))) &&
    (!row.addons || (Array.isArray(row.addons) && row.addons.every(addon =>
      isRecord(addon) && isText(addon.name) && isMoney(addon.price)))),
  customers: row => isText(row.name) && isText(row.phone) && isMoney(row.totalSpent),
  orders: row => isText(row.invoiceNo) && isText(row.channel) && isText(row.customerName) &&
    !Number.isNaN(Date.parse(row.createdAt)) && isMoney(row.total) &&
    [row.subtotal, row.cgst ?? 0, row.sgst ?? 0].every(isMoney) &&
    Array.isArray(row.items) && row.items.every(item => validLine(item) && isMoney(item.total)),
  tables: row => isText(row.name) && (!row.activeOrder ||
    (isRecord(row.activeOrder) && Array.isArray(row.activeOrder.items) && row.activeOrder.items.every(validLine))),
  expenses: row => isMoney(row.amount),
  suppliers: row => isText(row.name) && isMoney(row.totalSpend) && isMoney(row.balance),
  purchases: row => isText(row.invoiceNo) && isText(row.supplierId) && [row.totalAmount, row.subtotal, row.tax].every(isMoney),
  staff: row => isText(row.name) && isText(row.role) && isText(row.status) && (row.pin === undefined || isText(row.pin)),
  sequences: row => Number.isSafeInteger(row.next) && row.next > 0
};

export function validateBackup(data) {
  if (!isRecord(data) || data.database !== 'BrewBitePOS_DB_v2' || data.version !== 1 || !isRecord(data.settings)) {
    throw new Error('Choose a complete Brew & Bite backup with a supported version.');
  }

  if ('gstRate' in data.settings && (!isMoney(data.settings.gstRate) || data.settings.gstRate < 0 || data.settings.gstRate > 100)) {
    throw new Error('The backup contains an invalid tax rate.');
  }

  for (const field of ['brandName', 'invoicePrefix', 'upiVpaId', 'payeeName', 'defaultThermalSize']) {
    if (field in data.settings && !isText(data.settings[field])) throw new Error('The backup contains invalid cafe settings.');
  }
  if ('upiQrImage' in data.settings && data.settings.upiQrImage !== '' && !isUpiQrImage(data.settings.upiQrImage)) {
    throw new Error('The backup contains an invalid UPI QR image.');
  }
  if ('startingNumber' in data.settings &&
      (!Number.isSafeInteger(data.settings.startingNumber) || data.settings.startingNumber < 1)) {
    throw new Error('The backup contains an invalid invoice starting number.');
  }

  const keys = [...stores];
  if (data.sequences !== undefined) keys.push('sequences');
  for (const key of keys) {
    const rows = data[key];
    if (!Array.isArray(rows) || rows.some(row => !isRecord(row) || !isText(row.id) ||
      !row.id || row.id.includes('/') || row.id === '.' || row.id === '..' || (checkRow[key] && !checkRow[key](row))) ||
      new Set(rows.map(row => row.id)).size !== rows.length) {
      throw new Error(`The backup contains invalid or duplicate ${key} records.`);
    }
  }

  const supplierIds = new Set(data.suppliers.map(row => row.id));
  if (data.purchases.some(row => !supplierIds.has(row.supplierId))) {
    throw new Error('The backup contains a purchase whose supplier is missing.');
  }
  return data;
}

