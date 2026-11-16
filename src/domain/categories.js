export const categoryKey = name => (name || '').trim().toLowerCase();

export function mergeSavedCategories(saved, additions = []) {
  const library = new Map();
  const list = [
    ...(Array.isArray(saved) ? saved : (typeof saved === 'string' && saved.trim() ? [saved] : [])),
    ...(Array.isArray(additions) ? additions : (typeof additions === 'string' && additions.trim() ? [additions] : []))
  ];

  for (const cat of list) {
    if (typeof cat !== 'string') continue;
    const clean = cat.trim();
    if (!clean) continue;
    const key = categoryKey(clean);
    if (!library.has(key)) library.set(key, clean);
  }
  return [...library.values()];
}

export function removeSavedCategory(saved, categoryToRemove) {
  if (!Array.isArray(saved) || !categoryToRemove) return [];
  const targetKey = categoryKey(categoryToRemove);
  return saved.filter(cat => typeof cat === 'string' && categoryKey(cat) !== targetKey);
}
