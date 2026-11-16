import { newId } from './ids.js';
import { sanitizeText } from './sanitize.js';

export function parseMenuCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('category') || header.includes('item') || header.includes('price');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const products = [];
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 3) continue;

    const category = sanitizeText(parts[0], 50);
    const name = sanitizeText(parts[1], 100);
    const price = parseFloat(parts[2]);
    const costPrice = parts[3] ? parseFloat(parts[3]) || 0 : 0;
    const dietaryRaw = parts[4] || 'Pure Veg';
    const dietary = ['Non-Veg', 'Vegan', 'Pure Veg'].includes(dietaryRaw) ? dietaryRaw : 'Pure Veg';

    if (!name || !category || !Number.isFinite(price) || price < 0) continue;

    products.push({
      id: `prod-${newId()}`,
      name,
      sku: `ITEM-${newId().slice(0, 8).toUpperCase()}`,
      category,
      price,
      costPrice: Number.isFinite(costPrice) && costPrice >= 0 ? costPrice : 0,
      dietary,
      hasSizes: false,
      sizes: [],
      hasAddons: false,
      addons: []
    });
  }
  return products;
}
