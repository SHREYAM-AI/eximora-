import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Copy, Sparkles, ShieldCheck } from 'lucide-react';

interface WaitlistEntry {
  email: string;
  category: string;
  code: string;
  joinedAt: string;
}

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Overseas Buyer (Food)');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedEntry, setSavedEntry] = useState<WaitlistEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem('eximora_waitlist_entry');
      if (existing) {
        setSavedEntry(JSON.parse(existing));
        setStatus('success');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }

    setStatus('loading');

    setTimeout(() => {
      // Deterministic or random VIP reservation sequence
      const prefix = category.includes('Food') ? 'EXM-AGRO' : category.includes('Electronics') ? 'EXM-ELEC' : 'EXM-TRD';
      const hash = Math.floor(1000 + Math.random() * 9000);
      const code = `${prefix}-${hash}`;
      const entry: WaitlistEntry = {
        email: trimmed,
        category,
        code,
        joinedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      try {
        localStorage.setItem('eximora_waitlist_entry', JSON.stringify(entry));
        fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed, category, code }),
        }).catch(() => {});
      } catch {
        // ignore
      }

      setSavedEntry(entry);
      setStatus('success');
    }, 650);
  };

  const handleCopyCode = () => {
    if (!savedEntry) return;
    navigator.clipboard.writeText(savedEntry.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('eximora_waitlist_entry');
    } catch {
      // ignore
    }
    setSavedEntry(null);
    setStatus('idle');
    setEmail('');
  };

  if (status === 'success' && savedEntry) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.03] backdrop-blur-md border border-amber-500/30 dark:border-amber-400/25 shadow-xl dark:shadow-2xl text-center animate-in fade-in duration-300">
        <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-700 dark:text-amber-300 font-semibold">
          <span>Trade Registration Received</span>
        </div>

        <h3 className="text-xl font-serif text-slate-900 dark:text-white mt-1">Priority Desk Queued</h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Your onboarding request for <span className="text-slate-900 dark:text-white font-medium">{savedEntry.email}</span> is indexed under <span className="text-amber-800 dark:text-amber-200/90 font-medium">{savedEntry.category}</span>.
        </p>

        {/* Priority pass representation */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Trade Reference ID</span>
            <span className="text-lg font-mono font-semibold tracking-wider text-amber-800 dark:text-amber-200">
              {savedEntry.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 transition-colors shadow-xs"
            title="Copy reference code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-white/5">
          <span>Registered on {savedEntry.joinedAt}</span>
          <button
            type="button"
            onClick={handleReset}
            className="hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 transition-colors"
          >
            Register another entity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Trade participant selector */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl max-w-lg mx-auto mb-4">
          {(['Overseas Buyer (Food)', 'Indian Retailer (Electronics)', 'Producer & Partner'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex-1 min-w-[120px] py-1.5 px-2.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap text-center ${
                category === cat
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-white/15'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Form Input Group */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 rounded-2xl bg-white dark:bg-white/[0.04] backdrop-blur-md border border-slate-300 dark:border-white/15 shadow-md dark:shadow-2xl focus-within:border-amber-500 dark:focus-within:border-amber-400/50 transition-colors">
          <input
            id="waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter corporate or business email..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
            aria-label="Corporate email address for trading registration"
          />

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Registering...</span>
              </span>
            ) : (
              <>
                <span>Register Interest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3.5 py-2 rounded-xl text-center">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1 font-mono">
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-300/60" />
          <span>Verified trade counterparties</span>
          <span aria-hidden="true">·</span>
          <span>Quality certified sourcing</span>
          <span aria-hidden="true">·</span>
          <span>Zero spam</span>
        </div>
      </form>
    </div>
  );
}
