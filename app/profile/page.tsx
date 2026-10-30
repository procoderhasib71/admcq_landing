'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, CalendarDays, Check, KeyRound, Loader2, Phone, Send, Target, Trophy, UserRound } from 'lucide-react';
import { ACCENT, COURSES, type CourseId } from '@/lib/courses';
import { bn, initials, pct, showDate, useAccount } from '@/lib/useAccount';
import AccountButton from '../components/account-button';
import CourseIcon from '../components/course-icon';
import { BotPanel, card, CoursesPanel, MsgBox, NamePanel, PasswordPanel } from '../components/account-panels';

// একটাই প্রোফাইল: অ্যাকাউন্ট, যে কোর্সগুলো নেওয়া (শুধু সেগুলো চালু), নাম-পাসওয়ার্ড, মাছরাঙা বট

export default function ProfilePage() {
    const acc = useAccount({ redirectIfLoggedOut: true });
    const [offer, setOffer] = useState<CourseId | null>(null);   // landing এর "কোর্স নিন" থেকে এলে

    useEffect(() => {
        if (acc.status !== 'in') return;
        const want = new URLSearchParams(window.location.search).get('enroll');
        const p = acc.platforms.find((x) => x.id === want);
        Promise.resolve().then(() => setOffer(p && !p.enrolled ? p.id : null));
    }, [acc.status, acc.platforms]);

    const take = async (id: CourseId) => {
        if (await acc.enroll(id)) window.history.replaceState(null, '', '/profile');
    };

    if (acc.status === 'loading' || acc.status === 'out') return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]"><Loader2 className="animate-spin text-emerald-500" /></div>;
    const p = acc.profile;
    if (!p) return (
        <div className="min-h-screen flex items-center justify-center text-sm bg-slate-50 dark:bg-[#070b14] text-slate-700 dark:text-slate-200 px-4 text-center">
            প্রোফাইল লোড করা যায়নি{acc.msg ? ` (${acc.msg.text})` : ''}। <Link href="/login" className="text-emerald-600 ml-1 font-semibold">লগইন</Link>
        </div>
    );

    const mine = acc.platforms.filter((x) => x.enrolled);
    const total = mine.reduce((s, x) => ({ attempted: s.attempted + x.attempted, correct: s.correct + x.correct }), { attempted: 0, correct: 0 });
    const offered = offer && COURSES.find((c) => c.id === offer);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100">
            <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-black text-black">A</div>
                        <span className="font-extrabold text-xl tracking-tight">Ad<span className="text-emerald-500">MCQ</span></span>
                    </Link>
                    <AccountButton />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
                {/* অ্যাকাউন্টের সারাংশ */}
                <section className={`${card} p-5 sm:p-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
                            {initials(p.name || 'A')}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-black truncate">{p.name || 'আপনার প্রোফাইল'}</h1>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                {(p.phone || p.email) && (
                                    <span className="flex items-center gap-1.5">
                                        {p.phone ? <Phone size={14} /> : <UserRound size={14} />}
                                        {p.phone ? bn(p.phone.replace('+88', '')) : p.email}
                                    </span>
                                )}
                                {showDate(p.since) && <span className="flex items-center gap-1.5"><CalendarDays size={14} /> সদস্য {showDate(p.since)} থেকে</span>}
                                {p.botLinked && <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400"><BadgeCheck size={14} /> বটে যুক্ত</span>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { icon: Target, value: bn(mine.length), text: 'চালু কোর্স' },
                            { icon: Check, value: bn(total.attempted), text: 'উত্তর দিয়েছেন' },
                            { icon: Trophy, value: `${bn(pct(total))}%`, text: 'সঠিকের হার' },
                        ].map((s) => (
                            <div key={s.text} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 p-3 sm:p-4">
                                <s.icon size={16} className="text-emerald-500" />
                                <div className="mt-2 text-lg sm:text-2xl font-black">{s.value}</div>
                                <div className="text-[11px] sm:text-xs text-slate-500">{s.text}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <MsgBox acc={acc} />

                {offered && (
                    <section className={`${card} p-5 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center gap-4`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ACCENT[offered.accent].icon}`}>
                            <CourseIcon id={offered.id} className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold">{offered.name} কোর্সটি নেবেন?</h2>
                            <p className="text-sm text-slate-500 mt-0.5">নিলে এটা আপনার প্রোফাইলে চালু হবে, একই লগইনে ঢুকতে পারবেন।</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setOffer(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">পরে</button>
                            <button onClick={() => take(offered.id)} disabled={Boolean(acc.busy)} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold disabled:opacity-60 cursor-pointer">কোর্স নিন</button>
                        </div>
                    </section>
                )}

                <CoursesPanel acc={acc} />

                {/* অ্যাকাউন্ট সেটিংস */}
                <section>
                    <h2 className="text-lg font-black mb-3">অ্যাকাউন্ট সেটিংস</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className={`${card} p-5 space-y-5`}>
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2"><UserRound size={17} className="text-emerald-500" /> নাম</h3>
                                <NamePanel acc={acc} />
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <h3 className="font-bold flex items-center gap-2"><Send size={17} className="text-sky-500" /> মাছরাঙা বট (Telegram)</h3>
                                <BotPanel acc={acc} />
                            </div>
                        </div>
                        <div className={`${card} p-5 space-y-3`}>
                            <h3 className="font-bold flex items-center gap-2"><KeyRound size={17} className="text-emerald-500" /> পাসওয়ার্ড</h3>
                            <PasswordPanel acc={acc} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
