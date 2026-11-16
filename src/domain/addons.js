export const addonNameKey = name => (name || '').trim().toLowerCase();
export const addonKey = ({ name, price }) => JSON.stringify([addonNameKey(name), price]);

export function mergeSavedAddons(saved, additions = []) {
  const library = new Map();
  for (const addon of [...(Array.isArray(saved) ? saved : []), ...additions]) {
    if (typeof addon?.name !== 'string' || !addon.name.trim() ||
        !Number.isFinite(addon.price) || addon.price < 0) continue;
    const key = addonKey(addon);
    if (!library.has(key)) library.set(key, { name: addon.name.trim(), price: addon.price });
  }
  return [...library.values()];
}

export function removeSavedAddon(saved, nameToRemove) {
  if (!Array.isArray(saved) || !nameToRemove) return [];
  const targetKey = addonNameKey(nameToRemove);
  return saved.filter(addon => addon && addonNameKey(addon.name) !== targetKey);
}

