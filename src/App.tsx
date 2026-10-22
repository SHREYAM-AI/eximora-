/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AmbientCanvas } from './components/AmbientCanvas';
import { SoundAmbiance } from './components/SoundAmbiance';
import { ManifestoModal } from './components/ManifestoModal';
import { InquiryModal } from './components/InquiryModal';
import { WaitlistForm } from './components/WaitlistForm';
import { ExoraChatbot } from './components/ExoraChatbot';
import { ArrowUpRight, ArrowRight, ArrowLeftRight, Wheat, Cpu, CheckCircle } from 'lucide-react';

export default function App() {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [inquiryModalState, setInquiryModalState] = useState<{
    isOpen: boolean;
    type: 'private' | 'press';
  }>({
    isOpen: false,
    type: 'private',
  });

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
            href="#corridors"
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0"
          >
            Two-Way Trade
          </a>
          <button
            type="button"
            onClick={() => setIsManifestoOpen(true)}
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Manifesto
          </button>
          <button
            type="button"
            onClick={() => setInquiryModalState({ isOpen: true, type: 'private' })}
            className="hover:text-white transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Trade Desk
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Optional Ambiance Control */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <SoundAmbiance />
          </div>
          <button
            type="button"
            onClick={scrollToWaitlist}
            className="px-4 sm:px-5 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-md"
          >
            Register Interest
          </button>
        </div>
      </header>

      {/* Main Hero & Content Canvas */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-14 sm:py-20 max-w-5xl mx-auto w-full text-center">
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
          <span>Launching Soon</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-brand font-medium tracking-tight text-white leading-[1.14] max-w-3xl mx-auto text-balance">
          Bilateral trade, precision orchestrated.
        </h1>

        {/* PROMINENT INTRODUCTION REQUESTED BY USER */}
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

        {/* Bilateral Trade Corridors Presentation (Not features, but bilateral supply flow representation) */}
        <div id="corridors" className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto text-left">
          {/* Corridor 1: Export */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
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

          {/* Corridor 2: Import */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
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
        </div>

        {/* Operating Pillars: Source, Certify, Ship, Sell */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono uppercase tracking-wider">
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

        {/* Registration Desk Form */}
        <div id="register-section" className="mt-12 w-full scroll-mt-24">
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
          <div className="flex items-center gap-6 text-slate-400">
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
              Trade Desk Inquiries
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

      {/* Floating AI Trade Concierge: Exora */}
      <ExoraChatbot />
    </div>
  );
}
