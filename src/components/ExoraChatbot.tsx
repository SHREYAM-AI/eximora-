import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, ChevronDown, Bot, User, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content:
    'Greetings. I am Exora, your AI trade concierge at Eximora. I can address inquiries regarding our Indian food export corridor, electronic accessories imports, our asset-light sourcing model, or guide your priority registration. How may I assist you today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  'How does food export from India work?',
  'What electronic accessories do you import?',
  'Explain the asset-light model',
  'How do I onboard as an overseas buyer?',
];

export function ExoraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          userMessage: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content:
          data.reply ||
          'Eximora facilitates cross-border two-way trade: exporting certified Indian agro & food products, and importing high-demand electronic accessories for Indian retail.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Graceful smart fallback
      let fallbackText =
        'Eximora operates as an asset-light, two-way trading house. We source certified Indian agro and food products for overseas buyers, and procure electronic accessories for Indian retailers. We source, certify, ship, and sell.';
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('food') || lower.includes('farmer') || lower.includes('export') || lower.includes('agro')) {
        fallbackText =
          'Our Food Export corridor connects certified Indian farmers and food processors directly to overseas commercial buyers. We manage quality certification, compliance testing, export packaging, and shipping without operating manufacturing facilities.';
      } else if (lower.includes('electronic') || lower.includes('accessory') || lower.includes('import') || lower.includes('retail')) {
        fallbackText =
          'Our Electronics Import corridor sources high-demand accessories (charging solutions, cables, audio accessories, wearable peripherals) directly from verified global manufacturers to supply Indian wholesalers, retailers, and online merchants.';
      } else if (lower.includes('asset-light') || lower.includes('model') || lower.includes('manufacture')) {
        fallbackText =
          'Being asset-light means Eximora does not own factories or heavy manufacturing machinery. Instead, we orchestrate the four core pillars: Sourcing high-grade products, Certifying quality and compliance, Shipping through global cold/dry logistics, and Selling to commercial counterparties.';
      } else if (lower.includes('register') || lower.includes('buyer') || lower.includes('contact') || lower.includes('waitlist')) {
        fallbackText =
          'You can register your interest directly using the form on this page, or select "Trade Desk" in the top navigation to submit a direct bilateral procurement inquiry.';
      }

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <div className="relative group">
            {/* Unread / Invitation Pill */}
            {hasUnread && (
              <div className="absolute -top-10 right-0 whitespace-nowrap bg-black/90 border border-amber-400/30 text-amber-200 text-[11px] font-mono px-3 py-1 rounded-full shadow-lg shadow-black/50 animate-bounce pointer-events-none flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Trade Concierge Online</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#12131A] via-[#161822] to-[#12131A] border border-amber-400/40 hover:border-amber-400/80 text-white shadow-2xl shadow-amber-950/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer backdrop-blur-md"
              aria-label="Open Exora AI Trade Concierge"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
              </div>

              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-semibold tracking-wide text-white font-serif">Exora</span>
                  <span className="text-[10px] font-mono text-amber-300/80">AI</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Trade Concierge</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Exora Chatbot"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0A0B10] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300/20 to-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-200">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-serif font-semibold text-white">Exora</h3>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-amber-300/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    Trade AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">Eximora Trade Concierge</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10"
                title="Restart dialogue"
                aria-label="Restart dialogue"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10"
                title="Minimize Exora"
                aria-label="Minimize Exora"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10"
                title="Close Exora"
                aria-label="Close Exora"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-400/15 border border-amber-400/30 text-white rounded-tr-none'
                      : 'bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      msg.role === 'user' ? 'text-amber-200/60 text-right' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown if only initial message) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 pt-1 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Inquiry prompts
              </span>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{suggestion}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-300 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white/[0.02] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Exora about bilateral trade corridors..."
                className="flex-1 bg-white/[0.04] border border-white/10 focus:border-amber-400/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 text-black rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                aria-label="Send message to Exora"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Exora Concierge · Eximora Bilateral Trade Desk
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
