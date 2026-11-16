// Production schema defaults for Brew & Bite Cafe POS - Zero local data
// All products, categories, addons, and sizes are retrieved solely from Cloud Firestore.

export const initialCommonAddons = [];

export const initialCategories = [];

export const initialSettings = {
  brandName: "Brew & Bite Cafe",
  tagline: "Fast Counter POS",
  ownerName: "Owner",
  phone: "",
  email: "diyasfreshcornerkvp@gmail.com",
  streetAddress: "",
  city: "",
  state: "",
  pincode: "",
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
  gstRate: 0,
  commonAddons: [],
  commonCategories: [],
  license: "Free Lifetime Edition"
};

export const initialTables = [];
export const initialProducts = [];
export const initialCustomers = [];
export const initialOrders = [];
export const initialSuppliers = [];
export const initialPurchases = [];
export const initialExpenses = [];
export const initialAuditLogs = [];
export const initialStaff = [];
