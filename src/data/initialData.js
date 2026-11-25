// Production schema defaults for Diya’s Fresh Corner POS - Zero local data
// All products, categories, addons, and sizes are retrieved solely from Cloud Firestore.

export const initialCommonAddons = [];

export const initialCategories = [];

export const initialSettings = {
  brandName: "Diya’s Fresh Corner",
  tagline: "Fast Counter POS",
  ownerName: "Owner",
  phone: "",
  email: "diyasfreshcornerkvp@gmail.com",
  streetAddress: "",
  city: "",
  state: "",
  pincode: "",
  invoicePrefix: "DFC-",
  startingNumber: 1001,
  defaultThermalSize: "80mm Standard POS Thermal",
  receiptFooterMessage: "Thank You For Dining With Us! Visit Again!",
  termsAndConditions: "Goods once sold cannot be returned. Please check bill before leaving counter.",
  upiVpaId: "",
  upiQrImage: "",
  payeeName: "Diya’s Fresh Corner",
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
