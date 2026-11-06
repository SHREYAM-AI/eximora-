/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AmbientCanvas } from './components/AmbientCanvas';
import { SoundAmbiance } from './components/SoundAmbiance';
import { ManifestoModal } from './components/ManifestoModal';
import { InquiryModal } from './components/InquiryModal';
import { WaitlistForm } from './components/WaitlistForm';
import { ExoraChatbot } from './components/ExoraChatbot';
import { AiOrderPlacementModal } from './components/AiOrderPlacementModal';
import { OrderPipelineViewer } from './components/OrderPipelineViewer';
import { MarketPerformanceDashboard } from './components/MarketPerformanceDashboard';
import { TradeCommunityHub } from './components/TradeCommunityHub';
import { AdminCentreModal } from './components/AdminCentreModal';
import { TradeOrder, TradeCorridor } from './types/order';
import { ArrowUpRight, ArrowRight, ArrowLeftRight, Wheat, Cpu, CheckCircle, Sparkles, Shield, Users } from 'lucide-react';

export default function App() {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [orderModalCorridor, setOrderModalCorridor] = useState<TradeCorridor>('export_agro');
  const [orderModalPresetPrompt, setOrderModalPresetPrompt] = useState<string>('');
  const [inquiryModalState, setInquiryModalState] = useState<{
    isOpen: boolean;
    type: 'private' | 'press';
  }>({
    isOpen: false,
    type: 'private',
  });

  const [orders, setOrders] = useState<TradeOrder[]>([]);

  // Record visitor session telemetry
  useEffect(() => {
    try {
      let sessionId = sessionStorage.getItem('eximora_session_id');
      if (!sessionId) {
        sessionId = 'sess-' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('eximora_session_id', sessionId);
      }
      fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: window.location.pathname,
          referrer: document.referrer || 'Direct Trade Traffic',
          corridorInterest: 'general',
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  // Load orders from server on mount
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server orders:', err);
      });
  }, []);

  const handleOpenOrderModal = (corridor: TradeCorridor = 'export_agro', presetPrompt: string = '') => {
    setOrderModalCorridor(corridor);
    setOrderModalPresetPrompt(presetPrompt);
    setIsOrderModalOpen(true);
  };

  const handleOrderPlaced = (newOrder: TradeOrder) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    // Smooth scroll to pipeline console
    setTimeout(() => {
      const el = document.getElementById('ai-order-system');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  const handleAdvanceOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend advance failed, applying optimistic update:', err);
    }

    // Client-side fallback stage progression
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
        if (ord.stage === 'registered') {
          const updatedMilestones = [...ord.milestones];
          if (updatedMilestones[1]) {
            updatedMilestones[1].completed = true;
            updatedMilestones[1].timestamp = now;
          }
          if (updatedMilestones[2]) {
            updatedMilestones[2].completed = true;
            updatedMilestones[2].timestamp = now;
          }
          return {
            ...ord,
            stage: 'execution' as const,
            progressPercent: 65,
            lastUpdated: now,
            milestones: updatedMilestones,
            fulfillmentDoc: {
              trackingNumber: `EXM-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
              vesselOrFlight:
                ord.corridor === 'export_agro'
                  ? 'CMA CGM Mumbai Express / Voy 104W'
                  : 'Singapore Airlines Cargo SQ-712',
              inspectionPassId: `CERT-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
              fulfillmentStatus: 'In Execution - Vessel/Flight Dispatched',
            },
          };
        } else if (ord.stage === 'execution') {
          return {
            ...ord,
            stage: 'fulfilled' as const,
            progressPercent: 100,
            lastUpdated: now,
            milestones: ord.milestones.map((m) => ({ ...m, completed: true })),
            fulfillmentDoc: {
              trackingNumber: ord.fulfillmentDoc?.trackingNumber || 'EXM-TRK-980112',
              vesselOrFlight: ord.fulfillmentDoc?.vesselOrFlight || 'Direct Cargo Express',
              inspectionPassId: ord.fulfillmentDoc?.inspectionPassId || 'CERT-PASS-8819',
              fulfillmentStatus: 'Fulfilled & Handed Over',
            },
          };
        }
        return ord;
      })
    );
  };

  const scrollToWaitlist = () => {
    const el = document.getElementById('register-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('waitlist-email');
      if (input) {
        setTimeout(() => input.focus(), 350);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060608] text-slate-100 flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-200">
      {/* Interactive dynamic constellation backdrop */}
      <AmbientCanvas />

      {/* Atmospheric ambient radial lighting */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-amber-500/[0.035] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-subtle"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 right-10 w-[600px] h-[450px] bg-emerald-500/[0.025] rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Primary Action) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between gap-8 border-b border-white/[0.06]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg sm:text-xl font-brand font-bold tracking-[0.22em] uppercase text-white hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/20 flex items-center justify-center font-serif text-[11px] font-semibold text-amber-200 tracking-normal shadow-inner">
            E
          </span>
          <span>Eximora</span>
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-slate-400">
          <a
            href="#trade-community"
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Users className="w-3 h-3 text-amber-300" />
            <span>Community & Insights</span>
          </a>
          <a
            href="#ai-order-system"
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>AI Order Desk</span>
          </a>
          <a
            href="#market-performance"
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0"
          >
            Market Trends
          </a>
          <a
            href="#corridors"
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0"
          >
            Two-Way Trade
          </a>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="hover:text-amber-200 transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-amber-300/90"
            title="Open Eximora Operations & Intelligence Centre"
          >
            <Shield className="w-3 h-3" />
            <span>Admin Centre</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Optional Ambiance Control */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <SoundAmbiance />
          </div>
          <button
            type="button"
            onClick={() => handleOpenOrderModal('export_agro')}
            className="px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Place Order with AI</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Content Canvas */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 sm:py-16 max-w-5xl mx-auto w-full text-center">
        {/* Subtle emblem seal */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-md">
            <ArrowLeftRight className="w-7 h-7 text-amber-200/90" />
          </div>
        </div>

        {/* Clean Unboxed Kicker Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono tracking-[0.22em] uppercase text-amber-300/80 mb-5">
          <span>Two-Way Cross-Border Trading</span>
          <span aria-hidden="true">·</span>
          <span>Asset-Light Trader</span>
          <span aria-hidden="true">·</span>
          <span>AI Order Placement Active</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-brand font-medium tracking-tight text-white leading-[1.14] max-w-3xl mx-auto text-balance">
          Bilateral trade, precision orchestrated.
        </h1>

        {/* PROMINENT INTRODUCTION */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto text-left rounded-2xl bg-white/[0.025] backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle accent highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

          <div className="space-y-4 text-slate-200 leading-relaxed font-light text-base sm:text-lg">
            <p className="text-white font-normal text-lg sm:text-xl font-serif">
              Eximora is a two-way trading company.
            </p>
            <p className="text-slate-300">
              It exports food products from Indian farmers and processors to overseas buyers, and imports electronic accessories for Indian wholesalers, retailers and online sellers.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-start gap-3">
              <span className="text-amber-300 text-xs font-mono uppercase tracking-widest pt-1 shrink-0 font-medium">Model</span>
              <p className="text-amber-100/95 italic font-serif text-sm sm:text-base">
                It is an asset-light trader: it does not manufacture, it sources, certifies, ships and sells.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Dual CTA Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <button
            type="button"
            onClick={() => handleOpenOrderModal('export_agro')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-100 hover:to-amber-200 active:scale-[0.98] rounded-xl transition-all shadow-lg shadow-amber-950/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Place Order with AI</span>
          </button>

          <button
            type="button"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/15 active:scale-[0.98] rounded-xl border border-white/15 transition-all cursor-pointer"
          >
            <span>Register Interest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bilateral Trade Corridors Presentation */}
        <div id="corridors" className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto text-left">
          {/* Corridor 1: Export */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Export Corridor</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">India → Overseas</span>
              </div>
              <h3 className="text-base font-serif text-white mt-3 font-medium">Food & Agro Products</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sourcing authentic harvests and food items from Indian agricultural producers and certified processors, fulfilling bulk import contracts for overseas commercial buyers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenOrderModal('export_agro')}
              className="mt-4 pt-3 border-t border-white/5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>Order Food Exports with AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Corridor 2: Import */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Import Corridor</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">Global → India</span>
              </div>
              <h3 className="text-base font-serif text-white mt-3 font-medium">Electronic Accessories</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Procuring high-turnover consumer electronic accessories directly from international hubs to supply verified Indian wholesalers, retailers, and e-commerce sellers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenOrderModal('import_electronics')}
              className="mt-4 pt-3 border-t border-white/5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <span>Order Electronics Imports with AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Operating Pillars: Source, Certify, Ship, Sell */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Source</span>
          </span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Certify</span>
          </span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Ship</span>
          </span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Sell</span>
          </span>
        </div>

        {/* MARKET PERFORMANCE & REAL TRADE VOLUME TRENDS DASHBOARD */}
        <div className="mt-16 sm:mt-20 w-full">
          <MarketPerformanceDashboard orders={orders} onOpenOrderModal={handleOpenOrderModal} />
        </div>

        {/* BILATERAL IMPORT-EXPORT COMMUNITY & INDUSTRY INSIGHTS HUB */}
        <div className="mt-16 sm:mt-20 w-full">
          <TradeCommunityHub onOpenOrderModal={handleOpenOrderModal} />
        </div>

        {/* INTERACTIVE AI ORDER PLACEMENT & EXECUTION TRACKER */}
        <div className="mt-16 sm:mt-20 w-full">
          <OrderPipelineViewer
            orders={orders}
            onOpenOrderModal={() => handleOpenOrderModal('export_agro')}
            onAdvanceOrder={handleAdvanceOrder}
          />
        </div>

        {/* Registration Desk Form */}
        <div id="register-section" className="mt-16 sm:mt-20 w-full scroll-mt-24">
          <WaitlistForm />
        </div>

        {/* Secondary Editorial Actions */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Asset-light cross-border trade operations</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsManifestoOpen(true)}
              className="inline-flex items-center gap-1 text-slate-200 hover:text-amber-200 transition-colors font-medium cursor-pointer"
            >
              <span>Trade Manifesto</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-white/20">|</span>
            <button
              type="button"
              onClick={() => setInquiryModalState({ isOpen: true, type: 'private' })}
              className="inline-flex items-center gap-1 text-slate-200 hover:text-amber-200 transition-colors font-medium cursor-pointer"
            >
              <span>Procurement Liaison</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sound toggle on mobile */}
        <div className="sm:hidden mt-8">
          <SoundAmbiance />
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#060608]/80 backdrop-blur-sm py-8 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          {/* Wordmark and Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <span className="font-brand font-semibold tracking-widest text-slate-300 uppercase">
              Eximora
            </span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span>© 2026 Eximora. Two-way trade orchestration.</span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span>Asset-Light Trader</span>
          </div>

          {/* Trade Corridors & Desk Centers */}
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] tracking-wider uppercase">
            <span>Mumbai</span>
            <span aria-hidden="true">·</span>
            <span>Dubai</span>
            <span aria-hidden="true">·</span>
            <span>Singapore</span>
            <span aria-hidden="true">·</span>
            <span>Rotterdam</span>
          </div>

          {/* Direct Desk Actions */}
          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <a
              href="#trade-community"
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              <span>Community Hub</span>
            </a>
            <button
              type="button"
              onClick={() => handleOpenOrderModal('export_agro')}
              className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Order Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setInquiryModalState({ isOpen: true, type: 'private' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Procurement Desk
            </button>
            <button
              type="button"
              onClick={() => setInquiryModalState({ isOpen: true, type: 'press' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Trade Inquiries
            </button>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-300 text-amber-200/90 transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <Shield className="w-3 h-3 text-amber-300" />
              <span>Admin Centre</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ManifestoModal
        isOpen={isManifestoOpen}
        onClose={() => setIsManifestoOpen(false)}
      />
      <InquiryModal
        isOpen={inquiryModalState.isOpen}
        defaultType={inquiryModalState.type}
        onClose={() => setInquiryModalState({ isOpen: false, type: 'private' })}
      />
      <AiOrderPlacementModal
        isOpen={isOrderModalOpen}
        initialCorridor={orderModalCorridor}
        initialPrompt={orderModalPresetPrompt}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderModalPresetPrompt('');
        }}
        onOrderPlaced={handleOrderPlaced}
      />
      <AdminCentreModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onAdvanceOrder={handleAdvanceOrder}
        onOpenOrderModal={handleOpenOrderModal}
      />

      {/* Floating AI Trade Concierge: Exora */}
      <ExoraChatbot onOpenOrderModal={() => handleOpenOrderModal('export_agro')} />
    </div>
  );
}
