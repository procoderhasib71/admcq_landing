// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import CourseIcon from './components/course-icon';
import { ACCENT, CLASSROOM, COURSES } from '@/lib/courses';
import {
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  Layers,
  Timer,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

export default function HomePage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const badges = [
    {
      icon: Layers,
      text: 'অধ্যায় ও টপিকভিত্তিক প্রশ্নব্যাংক',
      color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/5'
    },
    {
      icon: Timer,
      text: 'রিয়েল-টাইম লাইভ টেস্ট',
      color: 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/5'
    },
    {
      icon: TrendingUp,
      text: 'উইক-জোন অ্যানালিটিক্স',
      color: 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Exam Engine',
      desc: 'নির্দিষ্ট সময়ে পরীক্ষা শুরু ও শেষ। লাইভ টাইমিং ও অ্যান্টি-চিটিং প্রোটেকশন।'
    },
    {
      icon: BarChart3,
      title: 'All-Bangladesh Merit List',
      desc: 'পরীক্ষা শেষ হওয়ামাত্র দেশজুড়ে পরীক্ষার্থীদের মধ্যে নিজের রিয়েল অবস্থান ও র‍্যাঙ্ক জানুন।'
    },
    {
      icon: ShieldCheck,
      title: 'Detailed Explanations',
      desc: 'প্রতিটি প্রশ্নের জন্য টেক্সটবুক রেফারেন্স সহ নির্ভুল ব্যাখ্যা ও সমাধান।'
    },
    {
      icon: Zap,
      title: 'Topic-wise Analytics',
      desc: 'কোন অধ্যায় বা সাবজেক্টে দুর্বলতা ও নেগেটিভ মার্ক বেশি হচ্ছে তা চিহ্নিত করুন।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 selection:bg-emerald-500 selection:text-white dark:selection:text-black transition-colors duration-300 overflow-x-hidden">

      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-50 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-black text-black text-lg sm:text-xl shadow-lg shadow-emerald-500/20 shrink-0">
              A
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
              Ad<span className="text-emerald-500 dark:text-emerald-400">MCQ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#units" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Courses</a>
            <a href="#features" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">About Platform</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {mounted ? (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle Theme"
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent animate-pulse" />
            )}

            {/* লগইন, রেজিস্ট্রেশন আর প্রোফাইল সব ক্লাসরুমে (app.admcq.com) */}
            <a
              href={CLASSROOM}
              className="px-4 py-2 sm:px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              Join Now
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 border-b border-slate-200 dark:border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs md:text-sm font-medium mb-5 sm:mb-6 shadow-sm dark:shadow-inner max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-[spin_8s_linear_infinite] shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span className="truncate">Admission MCQ Platform • Bangladesh</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-4 sm:mb-6 text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-blue-500 bg-clip-text text-transparent">
              Crack Your Dream Campus
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed px-2">
            Medical, Varsity Ka-Kha & Engineering ভর্তি পরীক্ষার্থীদের জন্য একটি আধুনিক এক্সাম ও সেলফ-অ্যাসেসমেন্ট প্ল্যাটফর্ম।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl mx-auto mb-8 sm:mb-10 px-1">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-sm shadow-sm ${badge.color}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{badge.text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <a
              href="#units"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
            >
              <span>কোর্সগুলো দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm sm:text-base shadow-sm text-center active:scale-95"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Target Units Section (Inline Logo + Text Layout) */}
      <section id="units" className="py-14 sm:py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            আমাদের কোর্সসমূহ
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            প্রতিটা কোর্সে কী কী আছে দেখুন। Join Now দিয়ে রেজিস্ট্রেশন করে পছন্দের কোর্স নিন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COURSES.map((c) => {
            const a = ACCENT[c.accent];
            return (
              <div
                key={c.id}
                className={`p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] transition-all duration-300 hover:shadow-xl flex flex-col ${a.ring}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
                      <CourseIcon id={c.id} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{c.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{c.title}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0 ${a.icon}`}>{c.stats}</span>
                </div>

                <ul className="mt-4 space-y-2 flex-1">
                  {c.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${a.dot}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a href={`${CLASSROOM}/profile?enroll=${c.id}`} className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black text-slate-800 dark:text-slate-100 text-sm font-bold transition-colors">
                  কোর্স নিন <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/70 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-3 text-slate-900 dark:text-white">
              Why Prepare with AdMCQ?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto px-2">
              সাধারণ প্র্যাকটিস নয়, পরীক্ষার পরিবেশেই গড়ে উঠুক আপনার কনফিডেন্স
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-start shadow-sm"
                >
                  <div className="p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Platform */}
      <section id="about" className="py-14 sm:py-20 max-w-5xl mx-auto px-4 text-center">
        <div className="p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Real Competition. Zero Distraction.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-5 sm:mb-6 px-1">
              ভর্তি পরীক্ষায় চূড়ান্ত সাফল্যের চাবিকাঠি হলো নির্ধারিত সময়ের সঠিক ব্যবহার এবং নেগেটিভ মার্ক এড়িয়ে চলা। AdMCQ সম্পূর্ণ স্বয়ংক্রিয়ভাবে শিক্ষার্থীদের রিয়েল-টাইম টেস্ট নেওয়া ও ইনস্ট্যান্ট মেরিট রেজাল্ট নিশ্চিত করে।
            </p>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-left sm:text-center">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Standard Question Bank • Real-time Testing Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] sm:text-xs text-slate-500 transition-colors duration-300 px-4">
        <p>© 2026 AdMCQ Platform. All rights reserved. Built for admission fighters across Bangladesh.</p>
      </footer>

    </div>
  );
}