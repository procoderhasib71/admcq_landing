// app/page.tsx
import React from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Atom,
  BookOpen,
  Cpu,
  ExternalLink,
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  Layers,
  Timer,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const units = [
    {
      id: 'medical',
      title: 'Medical & Dental',
      subTitle: 'মেডিকেল ও ডেন্টাল ইউনিট',
      desc: 'বায়োলজি, কেমিস্ট্রি, ফিজিক্স ও জিকে-ইংলিশের প্রশ্নব্যাংক সহ Real-time Negative Marking Model Test.',
      icon: Stethoscope,
      accent: 'emerald',
      subdomain: 'https://med.admcq.com',
      stats: '8,500+ Questions • National Rank',
      badge: 'Medical Special',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'ka',
      title: "Varsity 'Ka' (Science)",
      subTitle: "ভার্সিটি 'ক' / সায়েন্স ইউনিট",
      desc: 'ঢাকা বিশ্ববিদ্যালয় সহ সকল শীর্ষ বিশ্ববিদ্যালয়ের স্ট্যান্ডার্ড ম্যাথ, ফিজিক্স ও কেমিস্ট্রি Timed Test.',
      icon: Atom,
      accent: 'blue',
      subdomain: 'https://ka.admcq.com',
      stats: '12,000+ Questions • Mega Test',
      badge: 'Varsity Science',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'kha',
      title: "Varsity 'Kha' (Arts & Law)",
      subTitle: "ভার্সিটি 'খ' / মানবিক ও আইন",
      desc: 'বাংলা, ইংরেজি এবং সাম্প্রতিক সাধারণ জ্ঞানের অথেনটিক প্রশ্ন ও Daily Timed Challenge.',
      icon: BookOpen,
      accent: 'amber',
      subdomain: 'https://kha.admcq.com',
      stats: '10,000+ Questions • GK Archive',
      badge: 'Arts & Social Science',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'eng',
      title: 'Engineering Special',
      subTitle: 'ইঞ্জিনিয়ারিং স্পেশাল ইউনিট',
      desc: 'BUET ও টেকনোলজি ভার্সিটির জন্য Conceptual Questions, Speed Analytics ও Doubt Solving.',
      icon: Cpu,
      accent: 'cyan',
      subdomain: 'https://eng.admcq.com',
      stats: '6,500+ Advanced Questions',
      badge: 'Engineering',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    }
  ];

  const badges = [
    {
      icon: Layers,
      text: 'অধ্যায় ও টপিকভিত্তিক প্রশ্নব্যাংক',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
    },
    {
      icon: Timer,
      text: 'রিয়েল-টাইম লাইভ টেস্ট',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5'
    },
    {
      icon: TrendingUp,
      text: 'উইক-জোন অ্যানালিটিক্স',
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/5'
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-black">

      {/* Navbar */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 bg-[#070b14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-emerald-500/20">
              A
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Ad<span className="text-emerald-400">MCQ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#units" className="hover:text-emerald-400 transition-colors">Target Units</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">About Platform</a>
          </nav>

          <div>
            <a
              href="#units"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-500/20"
            >
              Start Practice
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs sm:text-sm font-medium mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 animate-[spin_8s_linear_infinite] shrink-0 text-emerald-400" />
            <span>Admission MCQ Platform • Bangladesh</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6 text-white">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Crack Your Dream Campus
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
            Medical, Varsity Ka-Kha & Engineering ভর্তি পরীক্ষার্থীদের জন্য একটি আধুনিক এক্সাম ও সেলফ-অ্যাসেসমেন্ট প্ল্যাটফর্ম।
          </p>

          {/* ৩টি হাইলাইট ব্যাজ */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto mb-10">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-sm shadow-sm transition-transform hover:scale-105 ${badge.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{badge.text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#units"
              className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm sm:text-base"
            >
              Select Your Target Unit
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-800 font-semibold text-slate-200 hover:bg-slate-800 transition-all text-sm sm:text-base"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Target Units Section */}
      <section id="units" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white">
            Choose Your Target Unit
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            প্রতিটি ইউনিটের জন্য ডেডিকেটেড ওয়েব পোর্টাল, রেগুলার শিডিউল ও সমৃদ্ধ প্রশ্নব্যাংক
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {units.map((unit) => {
            const Icon = unit.icon;
            return (
              <a
                key={unit.id}
                href={unit.subdomain}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${unit.badgeColor}`}>
                      {unit.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-0.5">
                    {unit.title}
                  </h3>
                  <p className="text-xs font-medium text-emerald-400/90 mb-3">
                    {unit.subTitle}
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {unit.desc}
                  </p>
                </div>

                <div>
                  <div className="py-2.5 px-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 mb-5 font-mono">
                    {unit.stats}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    <span>Enter {unit.subdomain.replace('https://', '')}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/40 border-y border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-white">
              Why Prepare with AdMCQ?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              সাধারণ প্র্যাকটিস নয়, পরীক্ষার পরিবেশেই গড়ে উঠুক আপনার কনফিডেন্স
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-start"
                >
                  <div className="p-3 rounded-lg bg-slate-800/80 text-emerald-400 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Platform */}
      <section id="about" className="py-20 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Real Competition. Zero Distraction.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-6">
              ভর্তি পরীক্ষায় ভালো করার মূল চাবিকাঠি হলো নির্ধারিত সময়ের সঠিক ব্যবহার এবং নেগেটিভ মার্ক এড়িয়ে চলা। AdMCQ সম্পূর্ণ স্বয়ংক্রিয়ভাবে শিক্ষার্থীদের রিয়েল-টাইম টেস্ট নেওয়া ও ইনস্ট্যান্ট মেরিট রেজাল্ট নিশ্চিত করে।
            </p>
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Standard Question Bank • Real-time Testing Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 AdMCQ Platform. All rights reserved. Built for admission fighters across Bangladesh.</p>
      </footer>

    </div>
  );
}