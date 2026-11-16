import React, { useState } from 'react';
import { ArrowRight, Bell, Wheat } from 'lucide-react';
import { TradeCorridor } from '../types/order';

interface TiffyComingSoonSectionProps {
  onNotifyMe: () => void;
  onOpenOrderModal?: (corridor: TradeCorridor, presetPrompt?: string) => void;
}

const TIFFY_LOGO_SRC = '/assets/aistudio/Screenshot_2026-11-16_at_10.48.07_AM_5e8848d1.png';

export function TiffyComingSoonSection({
  onNotifyMe,
  onOpenOrderModal,
}: TiffyComingSoonSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      id="tiffy"
      aria-labelledby="tiffy-heading"
      className="w-full max-w-5xl mx-auto my-12 sm:my-16 scroll-mt-24 text-left"
    >
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Visual Brand Showcase Panel (Exact #162C1E Forest Backdrop Matching Tiffy Emblem) */}
          <div className="lg:col-span-5 bg-[#162C1E] p-8 sm:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[260px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-emerald-950/40 dark:border-white/10">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,185,66,0.12),transparent_65%)] pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-amber-200/80">
              <span>Tiffora Venture</span>
              <span aria-hidden="true">·</span>
              <span>Coming Soon</span>
            </div>

            <div className="relative z-10 my-8 w-full flex items-center justify-center">
              {!imageFailed ? (
                <img
                  src={TIFFY_LOGO_SRC}
                  alt="Tiffy by Tiffora — Coming Soon"
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="w-full max-w-[290px] sm:max-w-[320px] h-auto object-contain select-none rounded-xl"
                />
              ) : (
                <div className="w-full max-w-[280px] py-8 px-6 rounded-xl bg-[#1E462C] border border-amber-300/30 flex flex-col items-center gap-3">
                  <Wheat className="w-9 h-9 text-amber-300" />
                  <span className="text-3xl font-brand font-bold tracking-wide text-[#F4F1EA]">
                    tiffy
                  </span>
                </div>
              )}
            </div>

            <p className="relative z-10 text-xs font-mono text-[#E8E2D5]/80 tracking-wider">
              Farm-Direct Staples &amp; Daily Food Essentials
            </p>
          </div>

          {/* Editorial Overview & Early Access Action Panel */}
          <div className="lg:col-span-7 p-6 sm:p-9 lg:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-[0.18em] uppercase text-amber-800 dark:text-amber-300 font-semibold">
                <span>New Food Initiative by Tiffora</span>
                <span aria-hidden="true">·</span>
                <span>Coming Soon</span>
              </div>

              <h2
                id="tiffy-heading"
                className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 dark:text-white tracking-tight text-balance"
              >
                Tiffy — Coming Soon to Indian Households &amp; Retail
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                Built on Tiffora&apos;s verified interstate agricultural supply network, <strong className="font-medium text-slate-900 dark:text-white">Tiffy</strong> will bring farm-direct rice, pulses, cold-pressed oils, and everyday meal staples from producer-state cooperatives to regional grocers and daily tiffin kitchens.
              </p>

              {/* Hairline-Separated Factual Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-200 dark:border-white/10 text-xs">
                <div>
                  <span className="font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Origin Sourcing
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white mt-1 block">
                    Direct State FPOs
                  </span>
                </div>
                <div>
                  <span className="font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Quality Standard
                  </span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400 mt-1 block">
                    FSSAI &amp; AGMARK Graded
                  </span>
                </div>
                <div>
                  <span className="font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Launch Access
                  </span>
                  <span className="font-medium text-amber-800 dark:text-amber-300 mt-1 block">
                    Waitlist Open
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onNotifyMe}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify Me on Launch</span>
              </button>

              {onOpenOrderModal && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenOrderModal(
                      'export_agro',
                      'Interested in bulk interstate agro sourcing aligned with Tiffy retail grades.'
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Order Bulk Agro with Tiffora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
