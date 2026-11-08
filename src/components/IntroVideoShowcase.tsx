import React, { useState } from 'react';
import {
  Play,
  Wheat,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Film,
  Volume2,
} from 'lucide-react';

interface IntroVideoShowcaseProps {
  onOpenVideoModal: (chapterIndex?: number) => void;
  onOpenOrderModal?: (corridor: 'export_agro' | 'import_electronics') => void;
}

export function IntroVideoShowcase({
  onOpenVideoModal,
  onOpenOrderModal,
}: IntroVideoShowcaseProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<number>(0);

  const previewChapters = [
    {
      title: 'The Bilateral Vision',
      duration: '00:22',
      corridor: 'Bilateral Architecture',
      icon: Layers,
      color: 'amber',
      image: '/src/assets/images/video_intro_poster_1794159305622.jpg',
      description:
        'An asset-light cross-border trading company connecting Indian harvest producers with international buyers, while importing certified tech accessories for Indian sellers.',
    },
    {
      title: 'Food & Agro Export Corridor',
      duration: '00:23',
      corridor: 'India → World',
      icon: Wheat,
      color: 'emerald',
      image: '/src/assets/images/video_scene_agro_export_1794159306274.jpg',
      description:
        'Direct sourcing of Basmati rice, organic spices, and pulses from certified farmer cooperatives in Punjab & Gujarat with APEDA & FSSAI laboratory testing.',
    },
    {
      title: 'Electronics Import Corridor',
      duration: '00:23',
      corridor: 'World → India',
      icon: Cpu,
      color: 'amber',
      image: '/src/assets/images/video_scene_electronics_import_1794159307584.jpg',
      description:
        'High-velocity GaN wall chargers, braided 100W PD cables, and consumer audio peripherals with rigorous BIS CRS IS 13252 & RoHS certification.',
    },
    {
      title: 'Four Operating Pillars',
      duration: '00:22',
      corridor: 'Source · Certify · Ship · Sell',
      icon: ShieldCheck,
      color: 'amber',
      image: '/src/assets/images/video_scene_trading_desk_1794159307086.jpg',
      description:
        'Zero factory overhead. End-to-end container logistics, rapid AI inquiry placement, and fully transparent bilateral customs clearance.',
    },
  ];

  const current = previewChapters[activePreviewTab];
  const CurrentIcon = current.icon;

  return (
    <div id="intro-video" className="w-full max-w-5xl mx-auto my-12 sm:my-16 scroll-mt-24 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300 font-semibold mb-1">
            <Film className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>Corporate Introduction Video</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Inside Eximora: Bilateral Trading in 90 Seconds
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-light">
            Explore our asset-light operating model, dual export and import corridors, and statutory quality certification protocols.
          </p>
        </div>

        {/* Watch Full Film Button */}
        <button
          type="button"
          onClick={() => onOpenVideoModal(activePreviewTab)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>Watch 90s Intro (Full Screen)</span>
        </button>
      </div>

      {/* Featured Video Cinema Showcase Container */}
      <div className="relative rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 overflow-hidden shadow-xl dark:shadow-2xl transition-colors">
        {/* Main 16:9 Cinema Viewport with Interactive Play Trigger */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-black group">
          <img
            src={current.image}
            alt={current.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette & Gradients for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

          {/* Big Center Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onOpenVideoModal(activePreviewTab)}
              className="group/btn relative flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/95 dark:bg-[#090A0E]/95 hover:bg-amber-300 dark:hover:bg-amber-400 text-slate-900 dark:text-white dark:hover:text-black border border-white/20 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Play intro video"
            >
              <span className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg group-hover/btn:bg-black group-hover/btn:text-amber-300 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
              <div className="text-left">
                <span className="block text-xs font-serif font-bold tracking-wide">
                  Play Video Overview
                </span>
                <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-900">
                  Chapter {activePreviewTab + 1}: {current.title} (90s Total)
                </span>
              </div>
            </button>
          </div>

          {/* Top Corner Metadata */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono text-amber-200">
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{current.corridor}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>Audio Narration & Captions</span>
              </span>
            </div>
          </div>

          {/* Bottom Screen Summary Description */}
          <div className="absolute bottom-4 left-4 right-4 max-w-xl bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/15 text-left pointer-events-none hidden sm:block">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 mb-1">
              <span>Chapter {activePreviewTab + 1} of 4</span>
              <span>·</span>
              <span>{current.duration}</span>
            </div>
            <h3 className="text-base font-serif font-bold text-white">{current.title}</h3>
            <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed line-clamp-2">
              {current.description}
            </p>
          </div>
        </div>

        {/* 4 Interactive Chapter Preview Tabs Below Video */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10">
          {previewChapters.map((chapter, idx) => {
            const isActive = idx === activePreviewTab;
            const Icon = chapter.icon;
            return (
              <div
                key={chapter.title}
                onClick={() => setActivePreviewTab(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-white dark:bg-white/10 border-amber-400/60 dark:border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                    : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                      0{idx + 1}. Part
                    </span>
                    <span>{chapter.duration}</span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-slate-900 dark:text-white line-clamp-1">
                    {chapter.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-light">
                    {chapter.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Icon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="truncate max-w-[110px]">{chapter.corridor}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVideoModal(idx);
                    }}
                    className="text-[11px] font-mono text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 font-medium inline-flex items-center gap-0.5"
                  >
                    <span>Play</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Track Strip */}
        <div className="px-5 py-3 bg-white dark:bg-[#07080C] border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Four Pillars:</span>
            <span>Source, Certify, Ship, Sell without manufacturing overhead.</span>
          </div>

          {onOpenOrderModal && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenOrderModal('export_agro')}
                className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 font-medium cursor-pointer"
              >
                Order Agro Export
              </button>
              <span className="text-slate-300 dark:text-white/20">·</span>
              <button
                type="button"
                onClick={() => onOpenOrderModal('import_electronics')}
                className="text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 font-medium cursor-pointer"
              >
                Order Electronics Import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
