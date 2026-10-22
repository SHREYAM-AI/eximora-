import { useState, useEffect } from 'react';
import { X, CheckCircle2, Send } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'private' | 'press';
}

export function InquiryModal({ isOpen, onClose, defaultType = 'private' }: InquiryModalProps) {
  const [inquiryType, setInquiryType] = useState<'private' | 'press'>(defaultType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setInquiryType(defaultType);
  }, [defaultType]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid corporate or private email address.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please provide your name.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Save inquiry to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('eximora_inquiries') || '[]');
        stored.push({
          id: 'INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          fullName,
          email,
          organization,
          inquiryType,
          message,
          date: new Date().toISOString(),
        });
        localStorage.setItem('eximora_inquiries', JSON.stringify(stored));
      } catch {
        // localStorage fallback
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setOrganization('');
    setMessage('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-[#0C0D11] border border-white/10 rounded-2xl p-6 sm:p-8 text-slate-200 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300/80">Direct Communication</span>
            <h2 id="inquiry-title" className="text-xl font-serif text-white tracking-wide mt-0.5">
              {inquiryType === 'press' ? 'Press & Media Relations' : 'Private & Institutional Dialogue'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/15"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-white">Inquiry Received</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your message has been dispatched securely to the Eximora executive office. A liaison will respond under confidential cover if alignment is determined.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 text-xs font-medium tracking-wide uppercase text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Return to Horizon
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => setInquiryType('private')}
                className={`flex-1 min-w-[140px] py-1.5 text-xs font-medium rounded transition-colors ${
                  inquiryType === 'private'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trade & Procurement Desk
              </button>
              <button
                type="button"
                onClick={() => setInquiryType('press')}
                className={`flex-1 min-w-[140px] py-1.5 text-xs font-medium rounded transition-colors ${
                  inquiryType === 'press'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Partnerships & Media
              </button>
            </div>

            <div>
              <label htmlFor="inquiry-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="inquiry-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Katherine Sterling"
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 focus:border-amber-400/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="inquiry-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Direct Email
              </label>
              <input
                id="inquiry-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liaison@institution.com"
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 focus:border-amber-400/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="inquiry-org" className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization / Office <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="inquiry-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Sterling Heritage Capital"
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 focus:border-amber-400/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="inquiry-msg" className="block text-xs font-medium text-slate-300 mb-1.5">
                Nature of Inquiry
              </label>
              <textarea
                id="inquiry-msg"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Brief summary of your inquiry..."
                className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 focus:border-amber-400/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium tracking-wide uppercase text-black bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-100 hover:to-amber-200 rounded-lg transition-all disabled:opacity-50 font-sans shadow-lg shadow-amber-950/20"
              >
                {isSubmitting ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
