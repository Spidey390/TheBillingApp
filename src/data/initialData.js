// Accurate initial dataset for Brew & Bite Cafe POS

export const initialSettings = {
  brandName: "Brew & Bite Cafe",
  tagline: "Bengaluru • Fast Counter POS",
  ownerName: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "contact@brewandbite.com",
  businessRegistration: "GST Registered Business",
  gstin: "29AAAAA0000A1Z5",
  streetAddress: "#42, 100 Feet Road, Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560038",
  invoicePrefix: "BB-",
  startingNumber: 1001,
  defaultThermalSize: "80mm Standard POS Thermal",
  receiptFooterMessage: "Thank You For Dining With Us! Visit Again!",
  termsAndConditions: "Goods once sold cannot be returned. Please check bill before leaving counter.",
  upiVpaId: "brewandbite@upi",
  payeeName: "Brew & Bite Cafe",
  autoBOMDeduction: true,
  audioBeepsEnabled: true,
  allowCashierDiscounts: true,
  gstRate: 5.0, // 5% total F&B GST (2.5% CGST, 2.5% SGST)
  license: "Free Lifetime Edition"
};

export const initialTables = [
  { id: 'T-01', name: 'Table 1 (Window)', floor: 'Main Floor', seats: 2, status: 'Available' },
  { id: 'T-02', name: 'Table 2', floor: 'Main Floor', seats: 4, status: 'Available' },
  { id: 'T-03', name: 'Table 3', floor: 'Main Floor', seats: 4, status: 'Available' },
  { id: 'T-04', name: 'Table 4 (Booth)', floor: 'Main Floor', seats: 6, status: 'Available' },
  { id: 'T-05', name: 'Table 5', floor: 'Main Floor', seats: 2, status: 'Available' },
  { id: 'T-06', name: 'Table 6 (Balcony)', floor: 'Balcony Garden', seats: 4, status: 'Available' },
  { id: 'T-07', name: 'Table 7 (Balcony)', floor: 'Balcony Garden', seats: 4, status: 'Available' },
  { id: 'T-08', name: 'Table 8 (Lounge)', floor: 'Balcony Garden', seats: 8, status: 'Available' },
  { id: 'T-09', name: 'Table 9 (Work Bar)', floor: 'Mezzanine', seats: 2, status: 'Available' },
  { id: 'T-10', name: 'Table 10 (Work Bar)', floor: 'Mezzanine', seats: 2, status: 'Available' },
];

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

export const initialProducts = [
  {
    id: 'prod-01',
    name: 'Cafe Latte',
    sku: 'COF-LAT',
    barcode: '8901001002',
    category: 'Coffee',
    price: 140,
    costPrice: 38,
    gstRate: 5,
    stock: 74,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
    hasSizes: true,
    sizes: [
      { name: 'Regular (240ml)', price: 140 },
      { name: 'Large (360ml)', price: 180 }
    ],
    bom: [
      { rawId: 'RAW-001', name: 'Arabica Coffee Beans', qty: 0.018, unit: 'KG' },
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.22, unit: 'Liter' }
    ]
  },
  {
    id: 'prod-02',
    name: 'Cappuccino & Warm Brownie Combo',
    sku: 'CMB-COF',
    barcode: '8901001002',
    category: 'Value Combos',
    price: 260,
    costPrice: 70,
    gstRate: 5,
    stock: 35,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-03',
    name: 'Caramel Macchiato',
    sku: 'COF-CAR',
    barcode: '8901001005',
    category: 'Coffee',
    price: 175,
    costPrice: 42,
    gstRate: 5,
    stock: 39,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-04',
    name: 'Classic Cappuccino',
    sku: 'COF-CAP',
    barcode: '8901001001',
    category: 'Coffee',
    price: 130,
    costPrice: 35,
    gstRate: 5,
    stock: 79,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    hasSizes: true,
    sizes: [
      { name: 'Regular (200ml)', price: 130 },
      { name: 'Large (320ml)', price: 170 }
    ],
    bom: [
      { rawId: 'RAW-001', name: 'Arabica Coffee Beans', qty: 0.018, unit: 'KG' },
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.18, unit: 'Liter' }
    ]
  },
  {
    id: 'prod-05',
    name: 'Classic Cold Coffee with Ice Cream',
    sku: 'COF-COLD',
    barcode: '8901001004',
    category: 'Coffee',
    price: 160,
    costPrice: 45,
    gstRate: 5,
    stock: 50,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-001', name: 'Arabica Coffee Beans', qty: 0.02, unit: 'KG' },
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.2, unit: 'Liter' },
      { rawId: 'RAW-012', name: 'Artisanal Vanilla Ice Cream', qty: 0.06, unit: 'Liter' },
      { rawId: 'RAW-003', name: 'Organic White Sugar', qty: 0.015, unit: 'KG' }
    ]
  },
  {
    id: 'prod-06',
    name: 'Classic Salted French Fries',
    sku: 'SNK-FRS',
    barcode: '8901006001',
    category: 'Snacks & Sides',
    price: 100,
    costPrice: 28,
    gstRate: 5,
    stock: 60,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-008', name: 'Imported French Fries Cut', qty: 0.18, unit: 'KG' }
    ]
  },
  {
    id: 'prod-07',
    name: 'Creamy Alfredo White Sauce Pasta',
    sku: 'PAS-WHT',
    barcode: '8901007001',
    category: 'Pasta & Noodles',
    price: 210,
    costPrice: 58,
    gstRate: 5,
    stock: 35,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817ee?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.04, unit: 'KG' },
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.12, unit: 'Liter' }
    ]
  },
  {
    id: 'prod-08',
    name: 'Crispy Veg Supreme Burger',
    sku: 'BGR-VEG',
    barcode: '8901008001',
    category: 'Burgers & Wraps',
    price: 130,
    costPrice: 38,
    gstRate: 5,
    stock: 58,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-005', name: 'Brioche Burger Buns', qty: 1, unit: 'Piece' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.02, unit: 'KG' }
    ]
  },
  {
    id: 'prod-09',
    name: 'Double Cheese Burst Burger',
    sku: 'BGR-CHS',
    barcode: '8901008002',
    category: 'Burgers & Wraps',
    price: 165,
    costPrice: 52,
    gstRate: 5,
    stock: 44,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-005', name: 'Brioche Burger Buns', qty: 1, unit: 'Piece' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.05, unit: 'KG' }
    ]
  },
  {
    id: 'prod-10',
    name: 'Farmhouse Feast Pizza',
    sku: 'PIZ-FRM',
    barcode: '8901009001',
    category: 'Pizza',
    price: 280,
    costPrice: 78,
    gstRate: 5,
    stock: 30,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    hasSizes: true,
    sizes: [
      { name: 'Regular 8"', price: 280 },
      { name: 'Large 11"', price: 390 }
    ],
    bom: [
      { rawId: 'RAW-007', name: 'Handcrafted Pizza Dough 8-inch', qty: 1, unit: 'Piece' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.09, unit: 'KG' }
    ]
  },
  {
    id: 'prod-11',
    name: 'Gourmet Veg Club Sandwich',
    sku: 'SND-GLB',
    barcode: '8901010001',
    category: 'Sandwiches',
    price: 140,
    costPrice: 36,
    gstRate: 5,
    stock: 50,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-010', name: 'Jumbo Sandwich Bread Loaf', qty: 0.15, unit: 'Packet' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.02, unit: 'KG' }
    ]
  },
  {
    id: 'prod-12',
    name: 'Kullad Masala Chai',
    sku: 'TEA-KLD',
    barcode: '8901011001',
    category: 'Tea & Chai',
    price: 60,
    costPrice: 12,
    gstRate: 5,
    stock: 149,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-004', name: 'Assam Masala Tea Leaves', qty: 0.008, unit: 'KG' },
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.1, unit: 'Liter' },
      { rawId: 'RAW-003', name: 'Organic White Sugar', qty: 0.008, unit: 'KG' }
    ]
  },
  {
    id: 'prod-13',
    name: 'Lemon Honey Green Tea',
    sku: 'TEA-LMN',
    barcode: '8901011002',
    category: 'Tea & Chai',
    price: 75,
    costPrice: 15,
    gstRate: 5,
    stock: 89,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-14',
    name: 'Loaded Cheese Garlic Bread',
    sku: 'SNK-GLB',
    barcode: '8901006002',
    category: 'Snacks & Sides',
    price: 140,
    costPrice: 40,
    gstRate: 5,
    stock: 40,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.04, unit: 'KG' }
    ]
  },
  {
    id: 'prod-15',
    name: 'Margherita Classic Pizza',
    sku: 'PIZ-MAR',
    barcode: '8901009002',
    category: 'Pizza',
    price: 220,
    costPrice: 55,
    gstRate: 5,
    stock: 40,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
    hasSizes: true,
    sizes: [
      { name: 'Regular 8"', price: 220 },
      { name: 'Large 11"', price: 320 }
    ],
    bom: [
      { rawId: 'RAW-007', name: 'Handcrafted Pizza Dough 8-inch', qty: 1, unit: 'Piece' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.08, unit: 'KG' }
    ]
  },
  {
    id: 'prod-16',
    name: 'New York Blueberry Cheesecake',
    sku: 'DST-CHK',
    barcode: '8901012001',
    category: 'Desserts & Bakes',
    price: 180,
    costPrice: 60,
    gstRate: 5,
    stock: 20,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-17',
    name: 'Nutella Hazelnut Shake',
    sku: 'BEV-NHT',
    barcode: '8901003001',
    category: 'Cold Beverages',
    price: 190,
    costPrice: 55,
    gstRate: 5,
    stock: 45,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-002', name: 'Fresh Full Cream Milk', qty: 0.25, unit: 'Liter' },
      { rawId: 'RAW-012', name: 'Artisanal Vanilla Ice Cream', qty: 0.05, unit: 'Liter' }
    ]
  },
  {
    id: 'prod-18',
    name: 'Peri Peri Spicy Fries',
    sku: 'SNK-PPR',
    barcode: '8901006003',
    category: 'Snacks & Sides',
    price: 120,
    costPrice: 32,
    gstRate: 5,
    stock: 55,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-008', name: 'Imported French Fries Cut', qty: 0.18, unit: 'KG' }
    ]
  },
  {
    id: 'prod-19',
    name: 'Red Sauce Arrabiata Pasta',
    sku: 'PAS-RED',
    barcode: '8901007002',
    category: 'Pasta & Noodles',
    price: 200,
    costPrice: 52,
    gstRate: 5,
    stock: 35,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.03, unit: 'KG' }
    ]
  },
  {
    id: 'prod-20',
    name: 'Single / Double Espresso',
    sku: 'COF-ESP',
    barcode: '8901001003',
    category: 'Coffee',
    price: 90,
    costPrice: 20,
    gstRate: 5,
    stock: 120,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    hasSizes: true,
    sizes: [
      { name: 'Single (30ml)', price: 90 },
      { name: 'Double (60ml)', price: 130 }
    ],
    bom: [
      { rawId: 'RAW-001', name: 'Arabica Coffee Beans', qty: 0.018, unit: 'KG' }
    ]
  },
  {
    id: 'prod-21',
    name: 'Virgin Mint Mojito',
    sku: 'BEV-MOJ',
    barcode: '8901003002',
    category: 'Cold Beverages',
    price: 120,
    costPrice: 28,
    gstRate: 5,
    stock: 40,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-22',
    name: 'Tandoori Paneer Tikka Wrap',
    sku: 'BGR-WRP',
    barcode: '8901008003',
    category: 'Burgers & Wraps',
    price: 150,
    costPrice: 45,
    gstRate: 5,
    stock: 40,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  },
  {
    id: 'prod-23',
    name: 'Grilled Cheese & Corn Sandwich',
    sku: 'SND-GCC',
    barcode: '8901010002',
    category: 'Sandwiches',
    price: 120,
    costPrice: 30,
    gstRate: 5,
    stock: 45,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-010', name: 'Jumbo Sandwich Bread Loaf', qty: 0.15, unit: 'Packet' },
      { rawId: 'RAW-006', name: 'Diced Mozzarella & Cheddar', qty: 0.03, unit: 'KG' }
    ]
  },
  {
    id: 'prod-24',
    name: 'Chocolate Lava Cake with Ice Cream',
    sku: 'DST-LVA',
    barcode: '8901012002',
    category: 'Desserts & Bakes',
    price: 150,
    costPrice: 42,
    gstRate: 5,
    stock: 30,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: [
      { rawId: 'RAW-012', name: 'Artisanal Vanilla Ice Cream', qty: 0.05, unit: 'Liter' }
    ]
  },
  {
    id: 'prod-25',
    name: 'Burger & Cold Coffee Meal Deal',
    sku: 'CMB-BGR',
    barcode: '8901002001',
    category: 'Value Combos',
    price: 240,
    costPrice: 65,
    gstRate: 5,
    stock: 30,
    dietary: 'Pure Veg',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    hasSizes: false,
    bom: []
  }
];

export const initialAvailableAddons = [
  { id: 'add-1', name: 'Extra Melted Cheese', price: 30 },
  { id: 'add-2', name: 'Extra Espresso Shot', price: 40 },
  { id: 'add-3', name: 'Almond / Oat Milk Upgrade', price: 50 },
  { id: 'add-4', name: 'Chipotle Garlic Dip', price: 25 },
  { id: 'add-5', name: 'Whipped Cream Topping', price: 30 },
  { id: 'add-6', name: 'Extra Ice Cream Scoop', price: 40 },
  { id: 'add-7', name: 'Extra Pickled Jalapenos', price: 20 },
];

export const initialRawMaterials = [
  { id: 'RAW-001', name: 'Arabica Coffee Beans', code: 'RAW-001', category: 'Coffee & Tea', currentStock: 12.464, minThreshold: 3, unit: 'KG', unitCost: 750, status: 'Sufficient' },
  { id: 'RAW-012', name: 'Artisanal Vanilla Ice Cream', code: 'RAW-012', category: 'Frozen', currentStock: 15, minThreshold: 4, unit: 'Liter', unitCost: 220, status: 'Sufficient' },
  { id: 'RAW-004', name: 'Assam Masala Tea Leaves', code: 'RAW-004', category: 'Coffee & Tea', currentStock: 7.985, minThreshold: 2, unit: 'KG', unitCost: 380, status: 'Sufficient' },
  { id: 'RAW-005', name: 'Brioche Burger Buns', code: 'RAW-005', category: 'Bakery', currentStock: 57, minThreshold: 15, unit: 'Piece', unitCost: 15, status: 'Sufficient' },
  { id: 'RAW-006', name: 'Diced Mozzarella & Cheddar', code: 'RAW-006', category: 'Dairy', currentStock: 13.87, minThreshold: 4, unit: 'KG', unitCost: 420, status: 'Sufficient' },
  { id: 'RAW-002', name: 'Fresh Full Cream Milk', code: 'RAW-002', category: 'Dairy', currentStock: 44.48, minThreshold: 10, unit: 'Liter', unitCost: 65, status: 'Sufficient' },
  { id: 'RAW-007', name: 'Handcrafted Pizza Dough 8-inch', code: 'RAW-007', category: 'Bakery', currentStock: 35, minThreshold: 10, unit: 'Piece', unitCost: 30, status: 'Sufficient' },
  { id: 'RAW-008', name: 'Imported French Fries Cut', code: 'RAW-008', category: 'Frozen', currentStock: 18, minThreshold: 5, unit: 'KG', unitCost: 160, status: 'Sufficient' },
  { id: 'RAW-010', name: 'Jumbo Sandwich Bread Loaf', code: 'RAW-010', category: 'Bakery', currentStock: 20, minThreshold: 5, unit: 'Packet', unitCost: 45, status: 'Sufficient' },
  { id: 'RAW-003', name: 'Organic White Sugar', code: 'RAW-003', category: 'Pantry', currentStock: 24.99, minThreshold: 5, unit: 'KG', unitCost: 45, status: 'Sufficient' }
];

export const initialCustomers = [
  {
    id: 'cust-1',
    name: 'Priya Patel',
    phone: '+91 97312 34567',
    email: 'priya.patel@outlook.com',
    ordersCount: 12,
    totalSpent: 6420.00,
    avgOrderValue: 535.0,
    notes: 'Loves farmhouse pizza and cold coffee.'
  },
  {
    id: 'cust-2',
    name: 'Sneha Rao',
    phone: '+91 98860 12345',
    email: 'sneha.rao@techcorp.in',
    ordersCount: 9,
    totalSpent: 4120.00,
    avgOrderValue: 457.8,
    notes: 'Prefers almond milk & oat latte.'
  },
  {
    id: 'cust-3',
    name: 'Rahul Sharma',
    phone: '+91 98451 23456',
    email: 'rahul.s@gmail.com',
    ordersCount: 8,
    totalSpent: 3850.00,
    avgOrderValue: 481.3,
    notes: 'Regular cappuccino lover. Prefers less sugar.'
  },
  {
    id: 'cust-4',
    name: 'Amit Verma',
    phone: '+91 99002 98765',
    email: 'amit.v@yahoo.com',
    ordersCount: 5,
    totalSpent: 2190.00,
    avgOrderValue: 438.0,
    notes: 'Corporate group order contact.'
  },
  {
    id: 'cust-5',
    name: 'Vikram Singh',
    phone: '+91 96111 87654',
    email: 'vikram.singh@gmail.com',
    ordersCount: 3,
    totalSpent: 1450.00,
    avgOrderValue: 483.3,
    notes: 'Weekend regular with family.'
  },
  {
    id: 'cust-6',
    name: 'Rahul',
    phone: '+91 98765 43210',
    email: 'rahul.walkin@example.com',
    ordersCount: 1,
    totalSpent: 530.25,
    avgOrderValue: 530.3,
    notes: 'Registered at counter'
  }
];

export const initialOrders = [
  {
    id: 'ord-1006',
    invoiceNo: 'BB-1006',
    tokenNo: 101,
    createdAt: '2026-10-07T07:44:00',
    displayDate: '07 Oct 07:44 am',
    channel: 'Dine In',
    table: 'Table 1 (Window)',
    tableId: 'T-01',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98451 23456',
    items: [
      { id: 'prod-01', name: 'Cafe Latte', variant: 'Regular (240ml)', price: 140, quantity: 1, total: 140 },
      { id: 'prod-11', name: 'Gourmet Veg Club Sandwich', price: 140, quantity: 1, total: 140 }
    ],
    itemsSummary: '1x Cafe Latte, 1x Gourmet Veg Club Sandwich',
    itemsCount: 2,
    subtotal: 280.00,
    cgst: 7.00,
    sgst: 7.00,
    discount: 0,
    total: 294.00,
    paymentMethod: 'UPI',
    status: 'Completed',
    cashierName: 'Rajesh Kumar (Owner)'
  },
  {
    id: 'ord-1005',
    invoiceNo: 'BB-1005',
    tokenNo: 101,
    createdAt: '2026-10-07T06:20:00',
    displayDate: '07 Oct 06:20 am',
    channel: 'Dine In',
    table: 'Table 4 (Booth)',
    tableId: 'T-04',
    customerName: 'Vikram Singh',
    customerPhone: '+91 96111 87654',
    items: [
      { id: 'prod-10', name: 'Farmhouse Feast Pizza', variant: 'Regular 8"', price: 280, quantity: 1, total: 280 },
      { id: 'prod-14', name: 'Loaded Cheese Garlic Bread', price: 140, quantity: 1, total: 140 },
      { id: 'prod-04', name: 'Classic Cappuccino', variant: 'Large (320ml)', price: 170, quantity: 2, total: 340 }
    ],
    itemsSummary: '1x Farmhouse Feast Pizza, 1x Loaded Cheese Garlic Bread, 2x Classic Cappuccino',
    itemsCount: 4,
    subtotal: 760.00,
    cgst: 19.00,
    sgst: 19.00,
    discount: 0,
    total: 829.50,
    paymentMethod: 'Split',
    status: 'Completed',
    cashierName: 'Sunita Rao (Cashier)'
  },
  {
    id: 'ord-1008',
    invoiceNo: 'BB-1008',
    tokenNo: 103,
    createdAt: '2026-10-07T06:32:00',
    displayDate: '07 Oct 06:32 am',
    channel: 'Dine In',
    table: 'Table 1 (Window)',
    tableId: 'T-01',
    customerName: 'Rahul',
    customerPhone: '+91 98765 43210',
    items: [
      {
        id: 'prod-01',
        name: 'Cafe Latte',
        variant: 'Large (360ml)',
        addons: ['Extra Melted Cheese'],
        notes: '',
        price: 210,
        quantity: 1,
        total: 210
      },
      {
        id: 'prod-08',
        name: 'Crispy Veg Supreme Burger',
        price: 130,
        quantity: 1,
        total: 130
      },
      {
        id: 'prod-09',
        name: 'Double Cheese Burst Burger',
        price: 165,
        quantity: 1,
        total: 165
      }
    ],
    itemsSummary: '1x Cafe Latte, 1x Crispy Veg Supreme Burger, 1x Double Cheese Burst Burger',
    itemsCount: 3,
    subtotal: 505.00,
    cgst: 12.63,
    sgst: 12.63,
    discount: 0,
    total: 530.25,
    paymentMethod: 'UPI',
    status: 'Completed',
    cashierName: 'Rajesh Kumar (Owner)'
  },
  {
    id: 'ord-1007',
    invoiceNo: 'BB-1007',
    tokenNo: 102,
    createdAt: '2026-10-07T04:00:00',
    displayDate: '07 Oct 04:00 am',
    channel: 'Dine In',
    table: 'Table 2',
    tableId: 'T-02',
    customerName: 'Walk-in Guest',
    customerPhone: '',
    items: [
      { id: 'prod-04', name: 'Classic Cappuccino', price: 130, quantity: 1, total: 130 },
      { id: 'prod-03', name: 'Caramel Macchiato', price: 175, quantity: 1, total: 175 },
      { id: 'prod-12', name: 'Kullad Masala Chai', price: 60, quantity: 3, total: 180 },
      { id: 'prod-06', name: 'Classic Salted French Fries', price: 100, quantity: 1, total: 100 }
    ],
    itemsSummary: '1x Classic Cappuccino, 1x Caramel Macchiato, 3x Kullad Masala Chai',
    itemsCount: 5,
    subtotal: 600.00,
    cgst: 15.00,
    sgst: 15.00,
    discount: 0,
    total: 630.00,
    paymentMethod: 'UPI',
    status: 'Completed',
    cashierName: 'Rajesh Kumar (Owner)'
  },
  {
    id: 'ord-1004',
    invoiceNo: 'BB-1004',
    tokenNo: 101,
    createdAt: '2026-10-06T08:20:00',
    displayDate: '06 Oct 08:20 am',
    channel: 'Delivery',
    table: '',
    customerName: 'Sneha Rao',
    customerPhone: '+91 98860 12345',
    items: [
      { id: 'prod-07', name: 'Creamy Alfredo White Sauce Pasta', price: 210, quantity: 2, total: 420 },
      { id: 'prod-21', name: 'Virgin Mint Mojito', price: 120, quantity: 1, total: 120 }
    ],
    itemsSummary: '2x Creamy Alfredo White Sauce Pasta, 1x Virgin Mint Mojito',
    itemsCount: 3,
    subtotal: 600.00,
    cgst: 15.00,
    sgst: 15.00,
    discount: 0,
    total: 630.00,
    paymentMethod: 'UPI',
    status: 'Completed',
    cashierName: 'Sunita Rao (Cashier)'
  },
  {
    id: 'ord-1003',
    invoiceNo: 'BB-1003',
    tokenNo: 101,
    createdAt: '2026-10-05T08:20:00',
    displayDate: '05 Oct 08:20 am',
    channel: 'Takeaway',
    table: '',
    customerName: 'Amit Verma',
    customerPhone: '+91 99002 98765',
    items: [
      { id: 'prod-08', name: 'Crispy Veg Supreme Burger', price: 130, quantity: 3, total: 390 },
      { id: 'prod-12', name: 'Kullad Masala Chai', price: 60, quantity: 3, total: 180 }
    ],
    itemsSummary: '3x Crispy Veg Supreme Burger, 3x Kullad Masala Chai',
    itemsCount: 6,
    subtotal: 570.00,
    cgst: 14.25,
    sgst: 14.25,
    discount: 0,
    total: 598.50,
    paymentMethod: 'Cash',
    status: 'Completed',
    cashierName: 'Sunita Rao (Cashier)'
  },
  {
    id: 'ord-1002',
    invoiceNo: 'BB-1002',
    tokenNo: 101,
    createdAt: '2026-10-04T08:20:00',
    displayDate: '04 Oct 08:20 am',
    channel: 'Dine In',
    table: 'Table 2',
    tableId: 'T-02',
    customerName: 'Priya Patel',
    customerPhone: '+91 97312 34567',
    items: [
      { id: 'prod-15', name: 'Margherita Classic Pizza', price: 220, quantity: 1, total: 220 },
      { id: 'prod-05', name: 'Classic Cold Coffee with Ice Cream', price: 160, quantity: 2, total: 320 }
    ],
    itemsSummary: '1x Margherita Classic Pizza, 2x Classic Cold Coffee',
    itemsCount: 4,
    subtotal: 610.00,
    cgst: 15.25,
    sgst: 15.25,
    discount: 10,
    total: 640.50,
    paymentMethod: 'Card',
    status: 'Completed',
    cashierName: 'Rajesh Kumar (Owner)'
  },
  {
    id: 'ord-1001',
    invoiceNo: 'BB-1001',
    tokenNo: 101,
    createdAt: '2026-10-03T08:20:00',
    displayDate: '03 Oct 08:20 am',
    channel: 'Dine In',
    table: 'Table 1 (Window)',
    tableId: 'T-01',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98451 23456',
    items: [
      { id: 'prod-04', name: 'Classic Cappuccino', price: 130, quantity: 2, total: 260 },
      { id: 'prod-06', name: 'Classic Salted French Fries', price: 100, quantity: 1, total: 100 }
    ],
    itemsSummary: '2x Classic Cappuccino, 1x Classic Salted French Fries',
    itemsCount: 3,
    subtotal: 360.00,
    cgst: 9.00,
    sgst: 9.00,
    discount: 0,
    total: 378.00,
    paymentMethod: 'UPI',
    status: 'Completed',
    cashierName: 'Sunita Rao (Cashier)'
  }
];

export const initialSuppliers = [
  {
    id: 'sup-1',
    name: 'Chikmagalur Coffee Plantation Ltd',
    contactPerson: 'Venkatesh Murthy',
    phone: '+91 94481 12345',
    email: 'orders@chikmagalurcoffee.in',
    gstin: '29AAACC1234F1Z1',
    totalSpend: 45000.00,
    balance: 0.00
  },
  {
    id: 'sup-2',
    name: 'Amul Dairy Distribution Bangalore',
    contactPerson: 'Suresh Patel',
    phone: '+91 98450 67890',
    email: 'amulbangalore@amul.coop',
    gstin: '29AABCA5678G1Z2',
    totalSpend: 32400.00,
    balance: 0.00
  },
  {
    id: 'sup-3',
    name: 'Bangalore Bakery & Packaging Supplies',
    contactPerson: 'Harish Kumar',
    phone: '+91 99001 23456',
    email: 'harish@blrpackaging.com',
    gstin: '29AADCB9012H1Z3',
    totalSpend: 18500.00,
    balance: 1200.00
  }
];

export const initialPurchases = [
  {
    id: 'pur-1',
    invoiceNo: 'INV-COF-8821',
    purchaseDate: '2026-10-07',
    supplierId: 'sup-1',
    supplierName: 'Chikmagalur Coffee Plantation Ltd',
    contactPerson: 'Venkatesh Murthy',
    itemsReceived: '10 KG Arabica Coffee Beans',
    subtotal: 7500.00,
    tax: 375.00,
    totalAmount: 7875.00,
    paymentMethod: 'BANK_TRANSFER'
  },
  {
    id: 'pur-2',
    invoiceNo: 'INV-AMUL-9904',
    purchaseDate: '2026-10-07',
    supplierId: 'sup-2',
    supplierName: 'Amul Dairy Distribution Bangalore',
    contactPerson: 'Suresh Patel',
    itemsReceived: '30 Liter Fresh Full Cream Milk, 5 KG Diced Mozzarella...',
    subtotal: 4200.00,
    tax: 210.00,
    totalAmount: 4410.00,
    paymentMethod: 'UPI'
  }
];

export const initialExpenses = [
  {
    id: 'exp-1',
    title: 'Social Media Instagram Marketing Promotion',
    category: 'Marketing',
    date: '2026-10-07',
    amount: 3500.00,
    paymentMethod: 'CARD',
    reference: 'FB-ADS-991',
    notes: 'Weekend special discount ad campaign'
  },
  {
    id: 'exp-2',
    title: 'Cafe Cleaning & Sanitization Supplies',
    category: 'Maintenance',
    date: '2026-10-07',
    amount: 1850.00,
    paymentMethod: 'CASH',
    reference: 'CASH-0021',
    notes: 'Eco-friendly cleaning supplies and napkins'
  },
  {
    id: 'exp-3',
    title: 'ACT Fibernet 300 Mbps High-speed Internet',
    category: 'Internet',
    date: '2026-10-07',
    amount: 1499.00,
    paymentMethod: 'CARD',
    reference: 'TXN-44912',
    notes: 'Free Wi-Fi for cafe guests & POS cloud sync'
  },
  {
    id: 'exp-4',
    title: 'BESCOM Electricity Bill',
    category: 'Electricity',
    date: '2026-10-07',
    amount: 8200.00,
    paymentMethod: 'UPI',
    reference: 'UPI-992812',
    notes: 'Power for commercial espresso machine & chillers'
  },
  {
    id: 'exp-5',
    title: 'Monthly Cafe Shop Rent (October)',
    category: 'Rent',
    date: '2026-10-07',
    amount: 45000.00,
    paymentMethod: 'BANK TRANSFER',
    reference: 'NEFT-883921',
    notes: 'Indiranagar commercial space rent'
  }
];

export const initialStaff = [
  {
    id: 'stf-1',
    name: 'Rajesh Kumar (Owner)',
    email: 'admin@caffeflow.com',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    pin: '1122',
    status: 'Active'
  },
  {
    id: 'stf-2',
    name: 'Rohan Verma (Kitchen/Floor)',
    email: 'staff@caffeflow.com',
    role: 'STAFF',
    phone: '+91 98765 43212',
    pin: '5566',
    status: 'Active'
  },
  {
    id: 'stf-3',
    name: 'Sunita Rao (Cashier)',
    email: 'cashier@caffeflow.com',
    role: 'CASHIER',
    phone: '+91 98765 43211',
    pin: '3344',
    status: 'Active'
  }
];

export const initialAuditLogs = [
  {
    id: 'log-1',
    timestamp: '2026-10-07 06:32:15',
    type: 'Recipe Deduction',
    itemType: 'Raw Material',
    changeQty: '-0.018 KG',
    previousStock: '12.482 KG',
    newStock: '12.464 KG',
    notes: 'Order BB-1008: 1x Cafe Latte auto-deduction',
    user: 'Rajesh Kumar'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-07 06:32:15',
    type: 'Recipe Deduction',
    itemType: 'Raw Material',
    changeQty: '-0.220 Liter',
    previousStock: '44.700 Liter',
    newStock: '44.480 Liter',
    notes: 'Order BB-1008: 1x Fresh Milk auto-deduction',
    user: 'Rajesh Kumar'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-07 06:32:15',
    type: 'Recipe Deduction',
    itemType: 'Raw Material',
    changeQty: '-2 Piece',
    previousStock: '59 Piece',
    newStock: '57 Piece',
    notes: 'Order BB-1008: 2x Brioche Buns auto-deduction',
    user: 'Rajesh Kumar'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-07 04:00:20',
    type: 'Purchase Inward',
    itemType: 'Raw Material',
    changeQty: '+10.000 KG',
    previousStock: '2.464 KG',
    newStock: '12.464 KG',
    notes: 'Inward INV-COF-8821 from Chikmagalur Coffee',
    user: 'Rajesh Kumar'
  }
];
