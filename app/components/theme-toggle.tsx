'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // ব্রাউজারে মাউন্ট হওয়ার আগ পর্যন্ত কিছু রেন্ডার হবে না (হাইড্রেশন মিসম্যাচ এড়াতে)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle Theme"
      className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-500 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}