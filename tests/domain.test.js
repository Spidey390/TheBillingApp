import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateBill, validateTender } from '../src/domain/billing.js';
import { businessDate, dateRange, inRange } from '../src/domain/dates.js';
import { normalizePhone } from '../src/domain/customers.js';
import { canOpen, homeView } from '../src/domain/access.js';
import { isTableOccupied } from '../src/domain/tables.js';
import { stores, validateBackup } from '../src/db/backup.js';
import { sanitizeText, sanitizeNumber } from '../src/domain/sanitize.js';
import { mergeSavedCategories, removeSavedCategory } from '../src/domain/categories.js';
import { mergeSavedAddons, removeSavedAddon } from '../src/domain/addons.js';
import { parseMenuCsv } from '../src/domain/csv.js';

test('new bills total menu prices less the rounded discount', () => {
  assert.deepEqual(calculateBill([{ price: 140, quantity: 2 }, { price: 260, quantity: 1 }], 10),
    { subtotal: 540, discount: 54, total: 486 });
  assert.deepEqual(calculateBill([{ price: 19.99, quantity: 2 }], 10),
    { subtotal: 39.98, discount: 4, total: 35.98 });
});

test('custom discounts recalculate in paise and cannot exceed the current subtotal', () => {
  assert.deepEqual(calculateBill([{ price: 310, quantity: 1 }], 12.5),
    { subtotal: 310, discount: 38.75, total: 271.25 });
  assert.deepEqual(calculateBill([{ price: 2.55, quantity: 1 }], 10),
    { subtotal: 2.55, discount: 0.26, total: 2.29 });
  assert.deepEqual(calculateBill([{ price: 180, quantity: 1 }, { price: 130, quantity: 1 }], 0, 42.99),
    { subtotal: 310, discount: 42.99, total: 267.01 });
  assert.deepEqual(calculateBill([{ price: 180, quantity: 1 }], 0, 250),
    { subtotal: 180, discount: 180, total: 0 });
  assert.deepEqual(calculateBill([{ price: 180, quantity: 1 }], 100),
    { subtotal: 180, discount: 180, total: 0 });
});

test('legacy reservations count as available unless they have an active order', () => {
  assert.equal(isTableOccupied({ status: 'Reserved', activeOrder: null }), false);
  assert.equal(isTableOccupied({ status: 'Reserved', activeOrder: { items: [{ quantity: 1 }] } }), true);
  assert.equal(isTableOccupied({ status: 'Occupied' }), true);
});

test('only finite exact cash and split tenders can settle a bill', () => {
  for (const cash of [1, 0, -147, NaN, Infinity, 147.001]) {
    assert.notEqual(validateTender('Cash', 147, cash), '');
  }
  assert.equal(validateTender('Cash', 147, 147), '');
  assert.equal(validateTender('Cash', 147, 200), '');
  assert.notEqual(validateTender('Split', 147, 147, { cash: 999, upi: 0 }), '');
  assert.notEqual(validateTender('Split', 147, 147, { cash: -1, upi: 148 }), '');
  assert.equal(validateTender('Split', 147.01, 147.01, { cash: 100.05, upi: 46.96 }), '');
});

test('orders roll over at India midnight and the week starts on Monday', () => {
  assert.equal(businessDate('2026-11-15T18:29:59Z'), '2026-11-15');
  assert.equal(businessDate('2026-11-15T18:30:00Z'), '2026-11-16');
  assert.deepEqual(dateRange('This Week', '2026-11-16'), ['2026-11-16', '2026-11-22']);
  assert.deepEqual(dateRange('Yesterday', '2027-01-01'), ['2026-12-31', '2026-12-31']);
  assert.deepEqual(dateRange('Specific Day', '2026-11-16', { date: '2026-11-10' }), ['2026-11-10', '2026-11-10']);
  assert.deepEqual(dateRange('Specific Day', '2026-11-16'), ['2026-11-16', '2026-11-16']);
  assert.equal(inRange('2026-10-07', dateRange('This Month', '2026-11-16')), false);
});

test('contact lookup recognizes equivalent formats and rejects nonphone input', () => {
  for (const input of ['9000000000', '+91 90000-00000', '919000000000']) {
    assert.equal(normalizePhone(input), '+919000000000');
  }
  assert.equal(normalizePhone('call-me'), '');
});

test('owner and staff routes enforce opposite POS vs administration access', () => {
  assert.equal(canOpen('owner', 'pos'), false);
  assert.equal(canOpen('staff', 'pos'), true);
  assert.equal(canOpen('staff', 'dashboard'), true);
  assert.equal(homeView('staff'), 'dashboard');
  assert.equal(canOpen('staff', 'settings'), false);
  assert.equal(canOpen('owner', 'settings'), true);
  assert.equal(canOpen('staff', 'tables'), true);
  assert.equal(canOpen('staff', 'expenses'), true);
  assert.equal(canOpen('owner', 'expenses'), true);
  assert.equal(canOpen('owner', 'suppliers'), false);
  assert.equal(canOpen('owner', 'inventory'), false);
});

test('restore rejects incomplete backups before replacing a workspace', () => {
  assert.throws(() => validateBackup({ database: 'BrewBitePOS_DB_v2', version: 1, settings: {}, orders: [] }),
    /invalid or duplicate tables/);
});

test('backup validation accepts current and legacy table records', () => {
  const table = { id: 'table-1', name: 'Table 1', seats: 4, activeOrder: null };
  const legacyTable = { ...table, id: 'table-2', name: 'Table 2', floor: 'Main Dining' };
  const backup = {
    ...Object.fromEntries(stores.map(name => [name, []])),
    database: 'BrewBitePOS_DB_v2', version: 1, settings: {}, tables: [table, legacyTable]
  };
  assert.deepEqual(validateBackup(backup).tables, [table, legacyTable]);
});

test('backup validation preserves orders with and without recorded tax', () => {
  const order = {
    id: 'current', invoiceNo: 'BB-12', channel: 'Takeaway', customerName: 'Walk-in',
    createdAt: '2026-11-16T08:00:00Z', subtotal: 100, total: 100, items: []
  };
  const oldOrder = { ...order, id: 'old', invoiceNo: 'BB-11', cgst: 2.5, sgst: 2.5, total: 105 };
  const backup = {
    ...Object.fromEntries(stores.map(name => [name, []])),
    database: 'BrewBitePOS_DB_v2', version: 1, settings: {}, orders: [order, oldOrder]
  };
  assert.deepEqual(validateBackup(backup).orders, [order, oldOrder]);
});

test('form input sanitization cleans control characters and enforces length bounds', () => {
  assert.equal(sanitizeText('  Cafe \u0000Latte\u202E  ', 20), 'Cafe Latte');
  assert.equal(sanitizeText('A very long product name that exceeds limit', 10), 'A very lon');
  assert.equal(sanitizeNumber('150.50', 0, 1000), 150.5);
  assert.equal(sanitizeNumber('-50', 0, 1000, 0), 0);
  assert.equal(sanitizeNumber('invalid', 0, 100, 10), 10);
});

test('categories are deduplicated case-insensitively and merged without defaults', () => {
  assert.deepEqual(mergeSavedCategories([]), []);
  assert.deepEqual(mergeSavedCategories(['Coffee', 'Tea'], ['coffee', 'Snacks', '  Tea  ']), ['Coffee', 'Tea', 'Snacks']);
  assert.deepEqual(mergeSavedCategories(null, 'Bakery'), ['Bakery']);
});

test('categories and addons can be removed cleanly', () => {
  assert.deepEqual(removeSavedCategory(['Coffee', 'Tea', 'Snacks'], 'tea'), ['Coffee', 'Snacks']);
  assert.deepEqual(removeSavedCategory(['Coffee', 'Tea'], 'Unknown'), ['Coffee', 'Tea']);
  assert.deepEqual(removeSavedAddon([{ name: 'Extra Cheese', price: 30 }, { name: 'Dip', price: 15 }], 'extra cheese'), [{ name: 'Dip', price: 15 }]);
  assert.deepEqual(removeSavedAddon([{ name: 'Dip', price: 15 }], 'Sauce'), [{ name: 'Dip', price: 15 }]);
});

test('menu CSV parser extracts valid products and ignores invalid rows', () => {
  const csv = 'Category,Item,Selling Price,Cost Price,Dietary Type\nBurger,Veg Burger,80,0,Pure Veg\nSnacks,French Fries,70,0,Pure Veg\ninvalid,row\n';
  const parsed = parseMenuCsv(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].name, 'Veg Burger');
  assert.equal(parsed[0].category, 'Burger');
  assert.equal(parsed[0].price, 80);
  assert.equal(parsed[1].name, 'French Fries');
});
