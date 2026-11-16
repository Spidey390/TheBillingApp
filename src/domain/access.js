const views = {
  owner: ['dashboard', 'orders', 'tables', 'menu', 'customers', 'expenses', 'reports', 'staff', 'settings'],
  staff: ['dashboard', 'pos', 'orders', 'tables', 'expenses']
};

export const canOpen = (role, view) => views[role]?.includes(view) ?? false;
export const homeView = role => views[role][0];
