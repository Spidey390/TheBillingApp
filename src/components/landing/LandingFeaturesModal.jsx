import React from 'react';
import { X, CheckCircle, Zap, Shield, Sparkles, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LandingFeaturesModal() {
  const { closeModal, setActiveView } = useApp();

  const capabilities = [
    { title: "38 Full HD Screen Captures", desc: "Exhaustive capture of every page, popup modal, bill preview, and settings tab." },
    { title: "Interactive POS Billing & Cart", desc: "Real-time menu catalog, category filtering, modifiers, and cart calculation." },
    { title: "Dine-In, Takeaway & Delivery", desc: "See which dining tables have open orders." },
    { title: "Dynamic UPI QR & Cash Checkout", desc: "On-screen dynamic QR code for instant UPI scan and quick cash change logic." },
    { title: "Thermal Receipts", desc: "58mm and 80mm receipt templates." },
    { title: "Table Management", desc: "Manage open orders and billing for each table." },
    { title: "Customers & Reports", desc: "Customer records, expenses and sales reports." },
  ];

  const specs = [
    { label: "Video Duration", value: "07m 27s (447s)" },
    { label: "Resolution", value: "720p HD (1280 x 720)" },
    { label: "Frame Rate", value: "30 FPS" },
    { label: "Total Screens", value: "38 Distinct Views" },
    { label: "Software", value: "Brew & Bite Cafe POS" },
    { label: "License", value: "Free Lifetime Edition" },
    { label: "Offline Storage", value: "IndexedDB / SQLite JSON" },
    { label: "Compiler", value: "Antigravity AI Engine" },
  ];

  const shortcuts = [
    { key: "Enter", action: "Confirm and complete payment in checkout modal" },
    { key: "Esc", action: "Dismiss any active popup modal" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#151a24] border border-[#2b3547] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-orange-600/20 via-[#181f2c] to-[#121620] border-b border-[#232b3a] flex items-start justify-between relative">
          <div>
            <span className="px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase bg-orange-500 text-white shadow-sm inline-block mb-2">
              COMPLETE VISUAL REFERENCE
            </span>
            <h1 className="text-2xl font-black text-white">Cafe Billing Software & POS System</h1>
            <p className="text-xs text-orange-300 font-medium mt-1">
              Free Lifetime POS, Multi-Table Billing & Order Management Walkthrough
            </p>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-[#1e2636] hover:bg-[#2c374c] text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Grid: Highlights vs Specs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Highlights */}
            <div className="md:col-span-7 space-y-3.5">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Document Highlights & Capabilities:</span>
              </h3>

              <div className="space-y-3">
                {capabilities.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#18202d] border border-[#242e40] space-y-1">
                    <div className="font-bold text-orange-400 flex items-center space-x-1.5">
                      <span className="text-xs font-mono font-black">[+]</span>
                      <span>{c.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-5">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Archive Specs */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#18202e] border border-[#263246] space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-[#2a374c] pb-2">
                  VIDEO ARCHIVE SPECS
                </h3>
                <div className="divide-y divide-[#232d3f] text-xs">
                  {specs.map((s, i) => (
                    <div key={i} className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">{s.label}</span>
                      <span className="font-mono font-bold text-slate-200 text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 rounded-2xl bg-[#18202e] border border-[#263246] space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-[#2a374c] pb-2">
                  KEYBOARD HOTKEYS
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((sc) => (
                    <div key={sc.key} className="flex items-center justify-between text-[11px]">
                      <kbd className="px-2 py-0.5 rounded bg-[#10141d] border border-[#2b364a] font-mono font-bold text-orange-400">
                        {sc.key}
                      </kbd>
                      <span className="text-slate-300 text-right">{sc.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Bar */}
          <div className="p-4 rounded-2xl bg-[#18202e] border border-[#28354a]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Instant Section Launch
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => { setActiveView('pos'); closeModal(); }}
                className="p-2.5 rounded-xl bg-[#121620] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#242e40] text-xs font-bold transition-all text-center"
              >
                POS Terminal (Screen #03)
              </button>
              <button
                onClick={() => { setActiveView('dashboard'); closeModal(); }}
                className="p-2.5 rounded-xl bg-[#121620] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#242e40] text-xs font-bold transition-all text-center"
              >
                Dashboard Metrics (Screen #01)
              </button>
              <button
                onClick={() => { setActiveView('orders'); closeModal(); }}
                className="p-2.5 rounded-xl bg-[#121620] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#242e40] text-xs font-bold transition-all text-center"
              >
                Orders & Invoices (Screen #16)
              </button>
              <button
                onClick={() => { setActiveView('tables'); closeModal(); }}
                className="p-2.5 rounded-xl bg-[#121620] hover:bg-orange-500 hover:text-white text-slate-300 border border-[#242e40] text-xs font-bold transition-all text-center"
              >
                Tables (Screen #24)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121620] border-t border-[#232b3a] flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <span>Confidential & Proprietary • Compiled from Demonstration Video • All Rights Reserved</span>
          <button
            onClick={closeModal}
            className="px-5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors self-end sm:self-auto"
          >
            Launch POS System
          </button>
        </div>
      </div>
    </div>
  );
}
