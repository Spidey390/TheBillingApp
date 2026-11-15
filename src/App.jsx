import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import OperationsDashboard from './components/dashboard/OperationsDashboard';
import PosTerminal from './components/pos/PosTerminal';
import OrdersKDS from './components/orders/OrdersKDS';
import TableManagement from './components/tables/TableManagement';
import MenuCatalog from './components/menu/MenuCatalog';
import InventoryBOM from './components/inventory/InventoryBOM';
import CustomerCRM from './components/crm/CustomerCRM';
import SuppliersPurchases from './components/suppliers/SuppliersPurchases';
import ExpenseManagement from './components/expenses/ExpenseManagement';
import BusinessReportsGST from './components/reports/BusinessReportsGST';
import StaffPermissions from './components/staff/StaffPermissions';
import CafeSettings from './components/settings/CafeSettings';

// Modals
import ItemCustomizationModal from './components/pos/ItemCustomizationModal';
import TableSelectModal from './components/pos/TableSelectModal';
import CustomerSelectModal from './components/pos/CustomerSelectModal';
import PaymentModal from './components/pos/PaymentModal';
import ReceiptModal from './components/receipt/ReceiptModal';
import LandingFeaturesModal from './components/landing/LandingFeaturesModal';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const { activeView, activeModal, toast } = useApp();

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-y-auto bg-[#0d1117]">
          {activeView === 'dashboard' && <OperationsDashboard />}
          {activeView === 'pos' && <PosTerminal />}
          {activeView === 'orders' && <OrdersKDS />}
          {activeView === 'tables' && <TableManagement />}
          {activeView === 'menu' && <MenuCatalog />}
          {activeView === 'inventory' && <InventoryBOM />}
          {activeView === 'customers' && <CustomerCRM />}
          {activeView === 'suppliers' && <SuppliersPurchases />}
          {activeView === 'expenses' && <ExpenseManagement />}
          {activeView === 'reports' && <BusinessReportsGST />}
          {activeView === 'staff' && <StaffPermissions />}
          {activeView === 'settings' && <CafeSettings />}
        </main>
      </div>

      {/* Modals Layer */}
      {activeModal === 'customization' && <ItemCustomizationModal />}
      {activeModal === 'tableSelect' && <TableSelectModal />}
      {activeModal === 'customerSelect' && <CustomerSelectModal />}
      {activeModal === 'payment' && <PaymentModal />}
      {activeModal === 'receipt' && <ReceiptModal />}
      {activeModal === 'landing' && <LandingFeaturesModal />}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1a2230] border border-[#2b374c] shadow-2xl text-xs font-bold text-white animate-in slide-in-from-bottom duration-200">
          {toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
