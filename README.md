# Brew & Bite Cafe POS — CaffeFlow Enterprise (Free Lifetime Edition)

A high-performance, pixel-faithful Cafe Billing Software & POS System with real-time inventory management, kitchen display system (KDS), table management, customer CRM, GST compliance, and dynamic UPI QR code checkout.

## 🚀 Key Features & Capabilities

- **Interactive POS Billing & Cart (Screens #03, #05, #07, #08, #09, #15)**
  - Touch-friendly 10-category product catalog with live stock tracking
  - Keyboard shortcuts (`F1` New Bill, `F2` Search, `F4` Pay, `F8` Table, `Esc`, `Enter`)
  - Barcode scanner integration with instant lookup
  - Order channel switcher (`Dine-In`, `Takeaway`, `Delivery`)
  - Item customization modal with sizes, add-ons (extra cheese, espresso shots, oat milk, dips), and kitchen special instructions
  - Automated GST calculation (5% F&B split into 2.5% CGST + 2.5% SGST) and discounts

- **Dynamic UPI QR & Cash Checkout (Screens #10, #11)**
  - Dynamic on-screen UPI QR code generator (`upi://pay?pa=...`) for instant customer scanning
  - Cash mode with quick denomination buttons (`₹531`, `₹1000`, `₹2000`) and live change calculation
  - Card & Split payment modes with reference tracking

- **Thermal Receipt & Kitchen KOT Engine (Screens #12, #13, #14)**
  - 80mm Wide Thermal POS format
  - 58mm Standard 2-inch Thermal format
  - Kitchen Order Ticket (KOT) format with token numbers and server details
  - A4 invoice view & direct browser printing (`Ctrl+P` / `window.print()`)

- **Live Orders & Kitchen Display System (KDS) (Screens #16 - #19)**
  - Time filters (`Today`, `Yesterday`, `This Week`, `This Month`, `All`)
  - Status management (`New`, `Preparing`, `Ready`, `Completed`, `Cancelled`)
  - Channel filtering (`Dine In`, `Takeaway`, `Delivery`)
  - 1-click invoice reprints and order viewing

- **Table & Seating Floor Plan Management (Screens #20, #21, #06)**
  - Multi-floor mapping (`Main Floor`, `Balcony Garden`, `Mezzanine`)
  - Real-time occupancy status (`Available`, `Occupied`, `Reserved`)
  - Direct `⚡ POS Bill` launcher linked to tables `T-01` to `T-10`

- **Inventory Management & Recipe BOM (Screens #24 - #26)**
  - Raw material ingredient batch tracking (Coffee beans, Milk, Sugar, Cheese, Buns)
  - Automatic recipe deduction on bill settlement
  - Detailed stock audit log
  - Low-stock alerts and threshold warnings

- **Customer CRM & Loyalty Database (Screen #27, #08)**
  - Track customer phone numbers, visit frequency, lifetime spend, and preferences
  - Quick customer lookup and registration modal at the billing counter

- **Procurement & Expenses (Screens #28, #29)**
  - Purchase invoices inward directory with vendor GSTINs
  - Daily expense & cashflow outflow logger with voucher reference tracking

- **Business Reports & GST Filing (Screens #30, #31)**
  - Executive financial KPIs: Gross Sales, GST Tax Collected, Operating Expenses, Net Profit
  - Standard Cafe 5.0% F&B tax breakdown table
  - Category sales breakdown and cashier sales ranking
  - Export CSV and print reports

- **Staff Permissions & Cafe Settings (Screens #32 - #40)**
  - Role management (Admin/Owner, Counter Cashier, Kitchen/Barista) with 4-digit PINs
  - Business profile, GSTIN configuration, thermal printer settings, UPI VPA setup
  - Automation toggles: Recipe BOM deduction, Web Audio API beeps/chimes, custom discounts
  - 1-click offline database JSON backup export & demo reset

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS + Custom Dark Theme
- **Icons**: Lucide React
- **QR Engine**: Canvas QRCode
- **Audio Engine**: Web Audio API Synthesizer (Zero external audio asset lag)
- **Effects**: Canvas Confetti
- **Storage**: LocalStorage & Offline JSON Backup

---

## 💻 Running the App

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
