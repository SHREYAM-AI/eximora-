import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Subtitles,
  Sparkles,
  Wheat,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Radio,
  FileText,
} from 'lucide-react';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderModal?: (corridor: 'export_agro' | 'import_electronics') => void;
  initialChapterIndex?: number;
}

interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;
  corridorBadge: string;
  corridorType: 'general' | 'export_agro' | 'import_electronics';
  imageSrc: string;
  headline: string;
  subheadline: string;
  narration: string;
  metrics: { label: string; value: string }[];
  tags: string[];
}

const CHAPTERS: VideoChapter[] = [
  {
    id: 'ch-vision',
    title: 'The Bilateral Vision',
    startTime: 0,
    endTime: 22,
    corridorBadge: 'Bilateral Trade Model',
    corridorType: 'general',
    imageSrc: '/src/assets/images/video_intro_poster_1794159305622.jpg',
    headline: 'Precision Cross-Border Commerce Without Industrial Inertia',
    subheadline: 'Eximora is a bilateral, asset-light trading house bridging Indian commodities with global tech supply chains.',
    narration:
      'Welcome to Eximora. We are a specialized two-way trading house designed for modern international commerce. Rather than burdened by manufacturing overhead, we operate an agile, asset-light bilateral network: exporting India’s finest agricultural products globally, and importing high-demand electronic accessories directly for Indian businesses.',
    metrics: [
      { label: 'Operating Corridors', value: '2 Bilateral' },
      { label: 'Asset Structure', value: 'Asset-Light' },
      { label: 'Core Philosophy', value: 'Source · Certify · Ship · Sell' },
    ],
    tags: ['Cross-Border Trading', 'Asset-Light', 'Two-Way Trade'],
  },
  {
    id: 'ch-agro-export',
    title: 'Food & Agro Exports',
    startTime: 22,
    endTime: 45,
    corridorBadge: 'Export Corridor · India → World',
    corridorType: 'export_agro',
    imageSrc: '/src/assets/images/video_scene_agro_export_1794159306274.jpg',
    headline: 'Connecting Certified Indian Farmers with Overseas Buyers',
    subheadline: 'From Punjab to Rotterdam: Premium Basmati rice, organic spices, and pulses sourced directly from certified farmer cooperatives.',
    narration:
      'In our export corridor, Eximora sources premium food and agro products from certified Indian farming cooperatives and state-of-the-art processing hubs in Punjab, Haryana, and Gujarat. Every shipment is rigorously verified under APEDA and FSSAI standards, ensuring absolute phytosanitary purity for international food importers and distributors.',
    metrics: [
      { label: 'Key Commodities', value: 'Basmati Rice, Spices, Pulses' },
      { label: 'Statutory Standards', value: 'APEDA · FSSAI · Phytosanitary' },
      { label: 'Primary Markets', value: 'Middle East, Europe, ASEAN' },
    ],
    tags: ['Basmati Rice', 'Organic Spices', 'APEDA Accredited', 'Bulk Container Freight'],
  },
  {
    id: 'ch-electronics-import',
    title: 'Electronics Accessories Import',
    startTime: 45,
    endTime: 68,
    corridorBadge: 'Import Corridor · World → India',
    corridorType: 'import_electronics',
    imageSrc: '/src/assets/images/video_scene_electronics_import_1794159307584.jpg',
    headline: 'High-Demand Tech Accessories for Indian Retail & E-Commerce',
    subheadline: 'Procuring high-turnover consumer electronics directly from top manufacturing clusters with full BIS CRS compliance.',
    narration:
      'In our import corridor, Eximora procures high-velocity electronic accessories—from Gallium Nitride fast wall chargers to braided 100W Power Delivery cables and audio peripherals. We handle end-to-end statutory testing, ensuring full BIS CRS IS 13252 and RoHS compliance so Indian wholesalers and e-commerce sellers can retail with zero customs friction.',
    metrics: [
      { label: 'Target Products', value: 'GaN Chargers, PD Cables, Audio' },
      { label: 'Compliance Standards', value: 'BIS CRS IS 13252 · RoHS 2.0' },
      { label: 'Distribution Channels', value: 'Wholesale, Retail, E-Commerce' },
    ],
    tags: ['GaN Chargers', 'Type-C PD Cables', 'BIS CRS Compliance', 'B2B Wholesale'],
  },
  {
    id: 'ch-four-pillars',
    title: 'The Four Operating Pillars',
    startTime: 68,
    endTime: 90,
    corridorBadge: 'Operational Execution',
    corridorType: 'general',
    imageSrc: '/src/assets/images/video_scene_trading_desk_1794159307086.jpg',
    headline: 'Source · Certify · Ship · Sell',
    subheadline: 'Zero inventory entrapment. Real-time AI docket placement and transparent multimodal logistics tracking.',
    narration:
      'Our operational model rests on four decisive pillars: We Source verified goods directly, Certify them under strict statutory norms, Ship them via integrated container routes, and Sell them to qualified counter-parties. With our AI order placement desk, vendors and buyers can execute cross-border inquiries in minutes.',
    metrics: [
      { label: 'Four Pillars', value: 'Source · Certify · Ship · Sell' },
      { label: 'Order Execution', value: 'Real-Time AI Intake' },
      { label: 'Inventory Risk', value: 'Zero Manufacturing Overhead' },
    ],
    tags: ['Source', 'Certify', 'Ship', 'Sell', 'AI Order Desk'],
  },
];

const TOTAL_DURATION = 90; // 90 seconds total

export function IntroVideoModal({
  isOpen,
  onClose,
  onOpenOrderModal,
  initialChapterIndex = 0,
}: IntroVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentChapterIndexRef = useRef<number>(-1);

  // Determine current chapter
  const currentChapterIndex = CHAPTERS.findIndex(
    (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
  );
  const activeChapter = CHAPTERS[currentChapterIndex !== -1 ? currentChapterIndex : 0];

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === ' ' && isOpen) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      stopNarration();
    };
  }, [isOpen, onClose, isFullscreen]);

  // Handle initial chapter jump
  useEffect(() => {
    if (isOpen && initialChapterIndex >= 0 && initialChapterIndex < CHAPTERS.length) {
      setCurrentTime(CHAPTERS[initialChapterIndex].startTime);
      setIsPlaying(true);
    }
  }, [isOpen, initialChapterIndex]);

  // Main playback timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25 * playbackRate;
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackRate]);

  // Voice narration orchestration using Web Speech API
  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playChapterNarration = (chapter: VideoChapter) => {
    if (!voiceNarrationEnabled || isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chapter.narration);
      utterance.rate = 1.02 * playbackRate;
      utterance.pitch = 0.98;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  };

  // Trigger narration when chapter changes while playing
  useEffect(() => {
    if (!isOpen) {
      stopNarration();
      return;
    }

    if (currentChapterIndex !== currentChapterIndexRef.current && isPlaying) {
      currentChapterIndexRef.current = currentChapterIndex;
      if (voiceNarrationEnabled && !isMuted) {
        playChapterNarration(activeChapter);
      }
    }
  }, [currentChapterIndex, isOpen, isPlaying, voiceNarrationEnabled, isMuted, playbackRate]);

  // Pause / Resume speech synthesis on play/pause toggle
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    if (!isPlaying) {
      window.speechSynthesis.pause();
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (voiceNarrationEnabled && !isMuted && currentChapterIndexRef.current === currentChapterIndex) {
        playChapterNarration(activeChapter);
      }
    }
  }, [isPlaying]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * TOTAL_DURATION;
    setCurrentTime(targetTime);
    currentChapterIndexRef.current = -1; // reset so narration restarts for selected chapter
  };

  const jumpToChapter = (chapterIndex: number) => {
    const ch = CHAPTERS[chapterIndex];
    if (ch) {
      setCurrentTime(ch.startTime);
      currentChapterIndexRef.current = -1;
      setIsPlaying(true);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eximora Introduction Video"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Video Cinema Console */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#090A0E] text-slate-100 rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col z-10 max-h-[96vh]"
      >
        {/* Top Cinema Bar: Title, Chapter Label & Close */}
        <div className="px-4 sm:px-6 py-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 truncate">
            <div className="w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-serif text-xs font-bold text-amber-300 shrink-0">
              E
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-brand tracking-widest uppercase font-bold text-white">
                  Eximora Overview
                </span>
                <span className="text-white/20">/</span>
                <span className="text-xs font-mono text-amber-300/90 truncate">
                  Chapter {currentChapterIndex + 1} of 4: {activeChapter.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Transcript Toggle */}
            <button
              type="button"
              onClick={() => setShowTranscript((prev) => !prev)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showTranscript
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Toggle interactive transcript"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transcript</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              aria-label="Close intro video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen & Visual Animation Canvas */}
        <div className="relative w-full aspect-video sm:max-h-[58vh] bg-black flex items-center justify-center overflow-hidden select-none group">
          {/* Active Chapter Visual Backdrop with smooth transition */}
          {CHAPTERS.map((chapter, idx) => {
            const isActive = idx === currentChapterIndex;
            return (
              <div
                key={chapter.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img
                  src={chapter.imageSrc}
                  alt={chapter.headline}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-10000 ease-out animate-kenburns"
                />
                {/* Cinematic film grain & vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/40 to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70" />
              </div>
            );
          })}

          {/* Interactive Screen Overlay: Chapter Title & Dynamic Subtitles */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between pointer-events-none z-10">
            {/* Top Corridor Banner */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono font-medium tracking-wide text-amber-200">
                {activeChapter.corridorType === 'export_agro' ? (
                  <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                ) : activeChapter.corridorType === 'import_electronics' ? (
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{activeChapter.corridorBadge}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
                  4K Ultra HD
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-[10px] font-mono text-amber-300 uppercase tracking-widest font-semibold">
                  Official
                </span>
              </div>
            </div>

            {/* Center Play Button on Pause (click surface) */}
            {!isPlaying && (
              <div className="self-center pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Play video"
                >
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-black ml-1" />
                </button>
              </div>
            )}

            {/* Bottom Subtitles & On-Screen Caption Bar */}
            <div className="space-y-3 pointer-events-auto">
              <div className="max-w-2xl bg-black/75 backdrop-blur-md p-4 rounded-xl border border-white/15 text-left shadow-2xl">
                <h3 className="text-base sm:text-xl font-serif font-bold text-white leading-snug">
                  {activeChapter.headline}
                </h3>
                {showCaptions && (
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                    {activeChapter.narration}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Scrubber & Timeline Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#0C0D13] border-t border-white/10 shrink-0">
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="relative w-full h-2.5 bg-white/10 rounded-full cursor-pointer group/bar overflow-hidden"
          >
            {/* Progress Fill */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Chapter Break Marks */}
            {CHAPTERS.map((ch, idx) => {
              if (idx === 0) return null;
              const posPercent = (ch.startTime / TOTAL_DURATION) * 100;
              return (
                <div
                  key={ch.id}
                  className="absolute top-0 bottom-0 w-[2px] bg-black/60 pointer-events-none"
                  style={{ left: `${posPercent}%` }}
                />
              );
            })}
          </div>

          {/* Time & Chapter Jump Markers */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(TOTAL_DURATION)}</span>
            </div>

            {/* Direct Chapter Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {CHAPTERS.map((ch, idx) => {
                const isActive = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => jumpToChapter(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    0{idx + 1}. {ch.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#090A0E] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Play/Pause, Rewind, Volume & Narration */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
                currentChapterIndexRef.current = -1;
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMuted((prev) => !prev);
                if (!isMuted) stopNarration();
                else playChapterNarration(activeChapter);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute narration' : 'Mute narration'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Voice Narration Mode Switch */}
            <button
              type="button"
              onClick={() => {
                setVoiceNarrationEnabled((prev) => {
                  const next = !prev;
                  if (!next) stopNarration();
                  else playChapterNarration(activeChapter);
                  return next;
                });
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                voiceNarrationEnabled && !isMuted
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Toggle AI voice narrator"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">Voice Narrator:</span>
              <span>{voiceNarrationEnabled && !isMuted ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Right: Speed, Captions, Fullscreen, and Order Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-[11px] font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    playbackRate === speed ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Subtitles Toggle */}
            <button
              type="button"
              onClick={() => setShowCaptions((prev) => !prev)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                showCaptions
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Toggle closed captions"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Contextual Action: Place Order */}
            {onOpenOrderModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const corridorTarget =
                    activeChapter.corridorType === 'import_electronics' ? 'import_electronics' : 'export_agro';
                  onOpenOrderModal(corridorTarget);
                }}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Order in Corridor</span>
                <span className="sm:hidden">Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Interactive Full Transcript & Chapter Deep-Dive */}
        {showTranscript && (
          <div className="p-4 sm:p-6 bg-black/90 border-t border-white/10 max-h-56 overflow-y-auto text-left space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Interactive Transcript (Click to seek)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">4 Segments · 90s</span>
            </div>

            <div className="space-y-3">
              {CHAPTERS.map((ch, idx) => {
                const isActive = idx === currentChapterIndex;
                return (
                  <div
                    key={ch.id}
                    onClick={() => jumpToChapter(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-amber-400/10 border-amber-400/30 text-white'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-amber-300/80 mb-1">
                      <span className="font-semibold">
                        0{idx + 1}. {ch.title}
                      </span>
                      <span>
                        {formatTime(ch.startTime)} - {formatTime(ch.endTime)}
                      </span>
                    </div>
                    <p className="leading-relaxed font-light">{ch.narration}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
