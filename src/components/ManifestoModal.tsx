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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-[#0C0D11] border border-white/10 rounded-2xl p-6 sm:p-10 text-slate-200 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300/80">Ethos & Vision</span>
            <h2 id="manifesto-title" className="text-xl sm:text-2xl font-serif text-white tracking-wide mt-1">
              The Eximora Manifesto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/15"
            aria-label="Close manifesto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 space-y-6 text-sm sm:text-base leading-relaxed text-slate-300 font-light">
          <p>
            Eximora is founded on the conviction that modern international commerce demands agile precision rather than cumbersome industrial inertia.
          </p>
          <p>
            As a two-way trading company, our purpose is twofold: opening global markets for high-grade food products cultivated by Indian farmers and certified processors, while securing dependable, high-demand electronic accessories for India&apos;s wholesalers, retailers, and online merchants.
          </p>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 my-6">
            <blockquote className="font-serif italic text-base sm:text-lg text-amber-100/90 leading-snug">
              &ldquo;We are an asset-light trader: we do not manufacture. We source, certify, ship, and sell with relentless standards of trust.&rdquo;
            </blockquote>
          </div>
          <p>
            By disintermediating fragmented broker networks and focusing our capital on rigorous quality certification, compliant cross-border logistics, and bilateral demand matching, Eximora bridges critical trade corridors between India and the world.
          </p>
          <p className="text-xs text-slate-500 pt-4 border-t border-white/5">
            Operational Document · Bilateral Trade Desks · Mumbai · Dubai · Singapore · Rotterdam
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium tracking-wide uppercase text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
