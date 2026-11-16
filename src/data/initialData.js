// Initial dataset for Brew & Bite Cafe POS - Clean Production State (Zero Mock Data)

export const initialCommonAddons = [
  { name: 'Extra Cheese', price: 30 },
  { name: 'Extra Espresso Shot', price: 40 },
  { name: 'Whipped Cream', price: 35 },
  { name: 'Caramel Syrup', price: 30 },
  { name: 'Hazelnut Syrup', price: 30 },
  { name: 'Vanilla Syrup', price: 30 },
  { name: 'Oat Milk Swap', price: 45 },
  { name: 'Almond Milk Swap', price: 45 },
  { name: 'Ice Cream Scoop', price: 50 },
  { name: 'Peri Peri Seasoning', price: 20 },
  { name: 'Extra Mayo Dip', price: 25 },
  { name: 'Extra Butter', price: 20 },
  { name: 'Jalapenos', price: 25 },
  { name: 'Olives', price: 25 }
];

export const initialSettings = {
  brandName: "Brew & Bite Cafe",
  tagline: "Bengaluru • Fast Counter POS",
  ownerName: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "contact@brewandbite.com",
  streetAddress: "#42, 100 Feet Road, Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560038",
  invoicePrefix: "BB-",
  startingNumber: 1001,
  defaultThermalSize: "80mm Standard POS Thermal",
  receiptFooterMessage: "Thank You For Dining With Us! Visit Again!",
  termsAndConditions: "Goods once sold cannot be returned. Please check bill before leaving counter.",
  upiVpaId: "",
  upiQrImage: "",
  payeeName: "Brew & Bite Cafe",
  audioBeepsEnabled: true,
  allowCashierDiscounts: true,
  allowStaffRefunds: false,
  gstRate: 0, // Retained for settings writes under existing Firestore rules.
  commonAddons: initialCommonAddons,
  license: "Free Lifetime Edition"
};

// The owner adds tables during setup.
export const initialTables = [];

export const initialCategories = [
  'Coffee',
  'Tea & Chai',
  'Cold Beverages',
  'Burgers & Wraps',
  'Pizza',
  'Sandwiches',
  'Pasta & Noodles',
  'Snacks & Sides',
  'Desserts & Bakes',
  'Value Combos'
];

export const initialProducts = [];

// Clean Production State: No mock customers, orders, suppliers, purchases, expenses or logs
export const initialCustomers = [];
export const initialOrders = [];
export const initialSuppliers = [];
export const initialPurchases = [];
export const initialExpenses = [];
export const initialAuditLogs = [];

export const initialStaff = [];
