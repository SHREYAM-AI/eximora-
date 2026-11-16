import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manifesto-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0C0D11] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 text-slate-800 dark:text-slate-200 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300/80 font-medium">Ethos & Vision</span>
            <h2 id="manifesto-title" className="text-xl sm:text-2xl font-serif text-slate-900 dark:text-white tracking-wide mt-1">
              The Tiffora Manifesto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 cursor-pointer"
            aria-label="Close manifesto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-light">
          <p>
            Tiffora is founded on the conviction that modern interstate commerce across India demands agile precision rather than fragmented mandi brokerages or industrial inertia.
          </p>
          <p>
            As a two-way interstate trading company, our purpose is twofold: opening Pan-India commercial markets for high-grade food products cultivated by farmers and certified processors in surplus agrarian states, while securing dependable, high-demand electronic accessories from metro tech hubs for state wholesalers, retailers, and online merchants.
          </p>
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 my-6">
            <blockquote className="font-serif italic text-base sm:text-lg text-amber-900 dark:text-amber-100/90 leading-snug">
              &ldquo;We are an asset-light interstate trader: we do not manufacture. We source, certify, ship, and sell across Indian state borders with relentless standards of trust.&rdquo;
            </blockquote>
          </div>
          <p>
            By disintermediating multi-tier state broker networks and focusing our capital on FSSAI/AGMARK &amp; BIS CRS quality certification, NIC E-Way Bill and IGST compliance, and express highway and rail logistics, Tiffora bridges critical two-way supply corridors across every major Indian state.
          </p>
          <p className="text-xs text-slate-500 pt-4 border-t border-slate-200 dark:border-white/5 font-mono">
            Operational Document · Interstate Trade Desks · Delhi NCR · Ludhiana · Ahmedabad · Mumbai · Bengaluru · Chennai
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold tracking-wide uppercase text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
