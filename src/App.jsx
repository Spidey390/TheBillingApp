import React from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './components/auth/LoginPage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import OperationsDashboard from './components/dashboard/OperationsDashboard';
import PosTerminal from './components/pos/PosTerminal';
import OwnerHub from './components/owner/OwnerHub';
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
import ShopManagementModal from './components/shops/ShopManagementModal';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const { 
    currentUser,
    activeView, 
    activeModal, 
    toast,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  // If user is not logged in, show Auth Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginPage />
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
      </>
    );
  }

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#0d1117] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Fixed Navbar */}
      <Navbar />

      {/* Main Workspace with Responsive Sidebar */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />
            {/* Drawer */}
            <div className="relative w-64 max-w-[80vw] bg-[#10141d] h-full shadow-2xl flex flex-col z-10 border-r border-[#242c3d] animate-in slide-in-from-left duration-200">
              <div className="p-3 border-b border-[#1f2737] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Navigation Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#1a2230] text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic View Area: Strictly Billing POS & Owner Hub */}
        <main className={`flex-1 flex flex-col min-h-0 min-w-0 bg-[#0d1117] ${activeView === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {activeView === 'pos' && <PosTerminal />}
          {(activeView === 'owner' || activeView === 'dashboard') && <OwnerHub />}
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
      {activeModal === 'shopManager' && <ShopManagementModal />}

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
