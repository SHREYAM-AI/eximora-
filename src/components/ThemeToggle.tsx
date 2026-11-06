import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('eximora_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Could not persist theme preference:', e);
    }
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
        isDark
          ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
      } ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-300 transition-transform hover:rotate-45" />
          {showLabel && <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-700 transition-transform hover:-rotate-12" />
          {showLabel && <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Dark Mode</span>}
        </>
      )}
    </button>
  );
}
