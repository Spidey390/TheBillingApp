import React, { useState } from 'react';
import { Menu, PanelsTopLeft, Coffee, UserRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dialog from './Dialog';
import { navigationItems } from './navigationItems';

export default function Navbar() {
  const { settings, operator, isOwner, activeView, setActiveView, isDbReady,
    isSidebarCollapsed, setIsSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen, signOut } = useApp();
  const [showProfile, setShowProfile] = useState(false);
  const closeProfile = () => setShowProfile(false);
  const name = operator.name?.trim() || operator.email;
  const role = isOwner ? 'Owner' : 'Staff';
  const page = navigationItems.find(item => item.id === activeView);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-700 bg-[#12161f] app-gutters">
      <button type="button" aria-label="Toggle navigation menu" title="Toggle Navigation Menu"
        aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-slate-800 md:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <button type="button" aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden rounded-lg p-2 hover:bg-slate-800 md:block">
        <PanelsTopLeft className="h-5 w-5" />
      </button>
      <span className="min-w-0 flex-1 truncate font-semibold md:hidden">
        {page?.mobileTitle ?? page?.label ?? settings.brandName}
      </span>
      <button type="button" onClick={() => setActiveView('dashboard')}
        className="hidden min-w-0 flex-1 items-center gap-2 text-left font-semibold md:flex" title={settings.brandName}>
        <Coffee className="h-5 w-5 shrink-0 text-orange-300" />
        <span className="truncate">{settings.brandName}</span>
      </button>
      {!isOwner && activeView !== 'pos' && (
        <button type="button" onClick={() => setActiveView('pos')} className="rounded bg-orange-700 px-3 py-2 text-sm font-bold">POS</button>
      )}
      {!isDbReady && <span className="hidden text-sm text-amber-300 md:block">Database unavailable</span>}
      <button type="button" aria-label="Open profile" aria-haspopup="dialog" title="Profile" onClick={() => setShowProfile(true)}
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-1.5 text-left hover:bg-slate-800 lg:pr-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-orange-500/25 bg-orange-500/10 text-orange-300">
          <UserRound className="size-4" aria-hidden="true" />
        </span>
        <span className="hidden max-w-36 truncate text-sm font-semibold lg:block">{name}</span>
      </button>
      {showProfile && (
        <Dialog label="Profile" onClose={closeProfile}>
          <section className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#171c26] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-2">
              <h2 className="font-bold text-white">Profile</h2>
              <button type="button" aria-label="Close profile" onClick={closeProfile}
                className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-slate-700/50">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex gap-3 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-500/10 text-orange-300">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
              <dl className="min-w-0 space-y-1">
                <div><dt className="sr-only">Name</dt><dd className="break-words font-semibold text-white">{name}</dd></div>
                {operator.email !== name && (
                  <div><dt className="sr-only">Email</dt><dd className="break-all text-sm text-slate-300">{operator.email}</dd></div>
                )}
                <div><dt className="sr-only">Role</dt><dd className="text-sm text-orange-300">{role}</dd></div>
              </dl>
            </div>
            <div className="border-t border-slate-700/60 p-3">
              <button type="button" onClick={() => { closeProfile(); signOut(); }}
                className="w-full rounded-lg bg-slate-800 hover:bg-slate-700/80 p-2 text-sm font-semibold text-rose-300 transition-colors">
                Sign out
              </button>
            </div>
          </section>
        </Dialog>
      )}
    </header>
  );
}
