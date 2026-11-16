import React, { lazy, Suspense, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dialog from './components/layout/Dialog';
import { Coffee, X } from 'lucide-react';
import { canOpen } from './domain/access';

const views = {
  dashboard: lazy(() => import('./components/dashboard/OperationsDashboard')),
  pos: lazy(() => import('./components/pos/PosTerminal')),
  orders: lazy(() => import('./components/orders/OrdersKDS')),
  tables: lazy(() => import('./components/tables/TableManagement')),
  menu: lazy(() => import('./components/menu/MenuCatalog')),
  customers: lazy(() => import('./components/crm/CustomerCRM')),
  expenses: lazy(() => import('./components/expenses/ExpenseManagement')),
  reports: lazy(() => import('./components/reports/BusinessReports')),
  staff: lazy(() => import('./components/staff/StaffPermissions')),
  settings: lazy(() => import('./components/settings/CafeSettings'))
};

const modals = {
  customization: lazy(() => import('./components/pos/ItemCustomizationModal')),
  tableSelect: lazy(() => import('./components/pos/TableSelectModal')),
  payment: lazy(() => import('./components/pos/PaymentModal')),
  receipt: lazy(() => import('./components/receipt/ReceiptModal'))
};

const loading = <p role="status" className="app-gutters py-4 sm:py-6 text-sm text-slate-300">Loading…</p>;

export default function App() {
  const { activeView, activeModal, toast, isMobileMenuOpen, setIsMobileMenuOpen,
    operator, isOwner, isDbReady, dbStatus, retryDatabase, settings } = useApp();
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeDrawer = event => { if (event.matches) setIsMobileMenuOpen(false); };
    desktop.addEventListener('change', closeDrawer);
    return () => desktop.removeEventListener('change', closeDrawer);
  }, [setIsMobileMenuOpen]);
  const View = views[activeView];
  const Modal = modals[activeModal];

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#0d1117] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="relative flex-1 flex min-h-0 min-w-0 overflow-hidden">
        <div className="hidden md:flex shrink-0 h-full"><Sidebar /></div>
        {isMobileMenuOpen && (
          <Dialog label="Navigation menu" className="items-stretch justify-start md:hidden"
            onClose={() => setIsMobileMenuOpen(false)}>
            <div className="flex min-h-0 w-[17.5rem] max-w-[85vw] flex-col overflow-hidden rounded-r-2xl border-r border-slate-700/70 bg-[#12161f] shadow-2xl">
              <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-700/60 pl-4 pr-3 py-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-300">
                  <Coffee className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white" title={settings.brandName}>
                  {settings.brandName}
                </span>
                <button type="button" aria-label="Close navigation" onClick={() => setIsMobileMenuOpen(false)}
                  className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <Sidebar mobile onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </Dialog>
        )}
        <main id="workspace" className={`flex-1 min-h-0 min-w-0 bg-[#0d1117] ${activeView === 'pos' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {!isDbReady ? (
            <div className="app-gutters py-4 sm:py-6 text-sm space-y-3">
              <p role="status">{dbStatus === 'loading' ? 'Connecting to Firebase…' :
                dbStatus === 'setup-required' ? 'The owner needs to sign in once to set up the workspace.' :
                'The workspace is unavailable. Check your connection and access.'}</p>
              {dbStatus === 'unavailable' && <button type="button" className="underline" onClick={retryDatabase}>Retry connection</button>}
            </div>
          ) : (
            <Suspense fallback={loading}>
              {View && canOpen(operator.role, activeView) ? (
                <View />
              ) : (
                <div className="app-gutters py-6 text-sm text-rose-300">
                  <p role="alert">Access denied: You do not have permission to view this section.</p>
                </div>
              )}
            </Suspense>
          )}
        </main>
        {toast && (
          <div role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-none absolute right-3 z-40 max-w-[min(24rem,calc(100%-1.5rem))] break-words rounded-lg border border-slate-600 bg-[#1a2230] px-3 py-2 text-sm shadow-lg ${activeView === 'pos' ? 'top-3' : 'bottom-3'}`}>
            {toast.message}
          </div>
        )}
      </div>
      {isDbReady && Modal && (!isOwner || activeModal === 'receipt') && (
        <Suspense fallback={loading}><Modal /></Suspense>
      )}
    </div>
  );
}
