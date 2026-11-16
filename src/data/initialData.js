// Initial dataset for Brew & Bite Cafe POS - Clean Production State (Zero Mock Data)

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
