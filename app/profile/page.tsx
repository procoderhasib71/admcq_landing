'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { ArrowUpRight, BadgeCheck, CalendarDays, Check, Copy, KeyRound, Loader2, Lock, LogOut, Phone, Plus, Send, Target, Trophy, UserRound } from 'lucide-react';
import { auth, phoneEmail } from '@/lib/firebase';
import { ACCENT, COURSES, type CourseId } from '@/lib/courses';
import CourseIcon from '../components/course-icon';

// একটাই প্রোফাইল: অ্যাকাউন্ট, যে কোর্সগুলো নেওয়া (শুধু সেগুলো চালু), নাম-পাসওয়ার্ড, মাছরাঙা বট

type Platform = { id: CourseId; name: string; url: string; enrolled: boolean; enrolledAt: string; attempted: number; correct: number; score: number };
type Profile = { uid: string; name: string; email: string; phone: string; since: string; botLinked: boolean };

const bn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const pct = (p: { attempted: number; correct: number }) => (p.attempted ? Math.round((p.correct * 100) / p.attempted) : 0);
const date = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
};
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322]';
const input = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-sm focus:outline-none focus:border-emerald-500';
const btn = 'px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold disabled:opacity-60 cursor-pointer transition-colors';
const label = 'text-[11px] font-semibold uppercase tracking-wider text-slate-500';

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [busy, setBusy] = useState('');
    const [pw, setPw] = useState({ current: '', next: '', again: '' });
    const [code, setCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [offer, setOffer] = useState<CourseId | null>(null);   // landing এর "কোর্স নিন" থেকে এলে

    const load = async () => {
        const r = await fetch('/api/profile', { cache: 'no-store' });
        if (r.status === 401) {
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return null;
        }
        const d = await r.json().catch(() => ({}));
        if (!d.success) {
            setMsg({ ok: false, text: d.error || `সার্ভার ${r.status}` });
            return null;
        }
        setProfile(d.profile);
        setPlatforms(d.platforms);
        return d as { profile: Profile; platforms: Platform[] };
    };

    useEffect(() => {
        load().then((d) => {
            if (d) {
                setName(d.profile.name);
                const want = new URLSearchParams(window.location.search).get('enroll');
                const p = d.platforms.find((x) => x.id === want);
                if (p && !p.enrolled) setOffer(p.id);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const enroll = async (id: CourseId) => {
        setBusy(`enroll-${id}`);
        const d = await (await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: id }) })).json().catch(() => ({}));
        if (d.success) {
            await load();
            setOffer(null);
            window.history.replaceState(null, '', '/profile');
            setMsg({ ok: true, text: `${COURSES.find((c) => c.id === id)?.name} কোর্সটি আপনার প্রোফাইলে যুক্ত হয়েছে` });
        } else setMsg({ ok: false, text: d.error || 'কোর্স নেওয়া যায়নি' });
        setBusy('');
    };

    const saveName = async () => {
        setBusy('name');
        const d = await (await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })).json().catch(() => ({}));
        if (d.success) {
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => null);
            setProfile((p) => (p ? { ...p, name: name.trim() } : p));
        }
        setMsg(d.success ? { ok: true, text: 'নাম সেভ হয়েছে' } : { ok: false, text: d.error || 'সেভ হয়নি' });
        setBusy('');
    };

    const changePassword = async () => {
        const user = auth.currentUser;
        if (!user || !profile?.phone) return setMsg({ ok: false, text: 'পাসওয়ার্ড বদলাতে লগআউট করে আবার লগইন করুন।' });
        if (pw.next.length < 6) return setMsg({ ok: false, text: 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।' });
        if (pw.next !== pw.again) return setMsg({ ok: false, text: 'দুই জায়গার নতুন পাসওয়ার্ড মেলেনি।' });
        setBusy('pw');
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(phoneEmail(profile.phone), pw.current));
            await updatePassword(user, pw.next);
            setPw({ current: '', next: '', again: '' });
            setMsg({ ok: true, text: 'পাসওয়ার্ড বদলানো হয়েছে, সব কোর্সে নতুনটা চলবে' });
        } catch (err) {
            const c = String((err as { code?: string })?.code || '');
            setMsg({ ok: false, text: c === 'auth/invalid-credential' || c === 'auth/wrong-password' ? 'এখনকার পাসওয়ার্ড ভুল।' : `বদলানো যায়নি (${c})` });
        } finally {
            setBusy('');
        }
    };

    const linkBot = async () => {
        const d = await (await fetch('/api/link-code', { method: 'POST' })).json().catch(() => ({}));
        if (d.success) setCode(d.code);
    };

    const logout = async () => {
        await Promise.allSettled([signOut(auth), fetch('/api/session', { method: 'DELETE' })]);
        window.location.href = '/';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]"><Loader2 className="animate-spin text-emerald-500" /></div>;
    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center text-sm bg-slate-50 dark:bg-[#070b14] text-slate-700 dark:text-slate-200 px-4 text-center">
            প্রোফাইল লোড করা যায়নি{msg ? ` (${msg.text})` : ''}। <Link href="/login" className="text-emerald-600 ml-1 font-semibold">লগইন</Link>
        </div>
    );

    const mine = platforms.filter((p) => p.enrolled);
    const others = platforms.filter((p) => !p.enrolled);
    const total = mine.reduce((s, p) => ({ attempted: s.attempted + p.attempted, correct: s.correct + p.correct }), { attempted: 0, correct: 0 });
    const offered = offer && COURSES.find((c) => c.id === offer);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100">
            <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-black text-black">A</div>
                        <span className="font-extrabold text-xl tracking-tight">Ad<span className="text-emerald-500">MCQ</span></span>
                    </Link>
                    <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors">
                        <LogOut size={16} /> লগআউট
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
                {/* অ্যাকাউন্টের সারাংশ */}
                <section className={`${card} p-5 sm:p-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
                            {initials(profile.name || 'A')}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-black truncate">{profile.name || 'আপনার প্রোফাইল'}</h1>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                {(profile.phone || profile.email) && (
                                    <span className="flex items-center gap-1.5">
                                        {profile.phone ? <Phone size={14} /> : <UserRound size={14} />}
                                        {profile.phone ? bn(profile.phone.replace('+88', '')) : profile.email}
                                    </span>
                                )}
                                {date(profile.since) && <span className="flex items-center gap-1.5"><CalendarDays size={14} /> সদস্য {date(profile.since)} থেকে</span>}
                                {profile.botLinked && <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400"><BadgeCheck size={14} /> বটে যুক্ত</span>}
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

                {msg && (
                    <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'}`}>
                        {msg.text}
                    </div>
                )}

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
                            <button onClick={() => enroll(offered.id)} disabled={Boolean(busy)} className={btn}>কোর্স নিন</button>
                        </div>
                    </section>
                )}

                {/* আমার কোর্স: শুধু এগুলো চালু */}
                <section>
                    <h2 className="text-lg font-black mb-3">আমার কোর্স</h2>
                    {mine.length === 0 ? (
                        <div className={`${card} p-6 text-center text-sm text-slate-500`}>এখনো কোনো কোর্স নেননি। নিচে থেকে একটা কোর্স নিন।</div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {mine.map((p) => {
                                const c = COURSES.find((x) => x.id === p.id)!;
                                return (
                                    <div key={p.id} className={`${card} p-5 flex flex-col`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ACCENT[c.accent].icon}`}>
                                                <CourseIcon id={p.id} className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold truncate">{p.name}</h3>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">● চালু</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                            <div><div className={label}>স্কোর</div><div className="font-black mt-0.5">{bn(Number(p.score.toFixed(2)))}</div></div>
                                            <div><div className={label}>উত্তর</div><div className="font-black mt-0.5">{bn(p.attempted)}</div></div>
                                            <div><div className={label}>সঠিক</div><div className="font-black mt-0.5">{bn(pct(p))}%</div></div>
                                        </div>
                                        <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct(p)}%` }} />
                                        </div>
                                        <a href={p.url} className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-colors">
                                            পোর্টালে যান <ArrowUpRight size={16} />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {others.length > 0 && (
                    <section>
                        <h2 className="text-lg font-black mb-3">আরও কোর্স</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {others.map((p) => (
                                <div key={p.id} className={`${card} p-4 flex items-center gap-3`}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm truncate">{p.name}</h3>
                                        <p className="text-xs text-slate-500">নেওয়া হয়নি</p>
                                    </div>
                                    <button onClick={() => enroll(p.id)} disabled={Boolean(busy)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold cursor-pointer disabled:opacity-60 transition-colors">
                                        {busy === `enroll-${p.id}` ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} কোর্স নিন
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* অ্যাকাউন্ট সেটিংস */}
                <section>
                    <h2 className="text-lg font-black mb-3">অ্যাকাউন্ট সেটিংস</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className={`${card} p-5 space-y-3`}>
                            <h3 className="font-bold flex items-center gap-2"><UserRound size={17} className="text-emerald-500" /> নাম</h3>
                            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" />
                            <button onClick={saveName} disabled={Boolean(busy)} className={btn}>সেভ করুন</button>

                            <div className="pt-4 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <h3 className="font-bold flex items-center gap-2"><Send size={17} className="text-sky-500" /> মাছরাঙা বট (Telegram)</h3>
                                {profile.botLinked && !code && <p className="text-sm text-slate-500">বটের সাথে যুক্ত আছে। বটে /mode দিয়ে কোর্স বদলানো যায়।</p>}
                                {code ? (
                                    <div className="space-y-2 text-sm">
                                        <p className="text-slate-500">১৫ মিনিটের মধ্যে বটে লিখুন:</p>
                                        <button onClick={() => { navigator.clipboard.writeText(`/site ${code}`); setCopied(true); }}
                                            className="w-full flex justify-between items-center px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono font-bold cursor-pointer">
                                            /site {code} {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                        <a href="https://t.me/Machranga_ai_bot" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold">বট খুলুন</a>
                                    </div>
                                ) : (
                                    <button onClick={linkBot} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold cursor-pointer">
                                        <Send size={15} /> {profile.botLinked ? 'আবার যুক্ত করুন' : 'বটের সাথে যুক্ত করুন'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {profile.phone ? (
                            <div className={`${card} p-5 space-y-3`}>
                                <h3 className="font-bold flex items-center gap-2"><KeyRound size={17} className="text-emerald-500" /> পাসওয়ার্ড বদলান</h3>
                                <input className={input} type="password" autoComplete="current-password" placeholder="এখনকার পাসওয়ার্ড" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                                <input className={input} type="password" autoComplete="new-password" placeholder="নতুন পাসওয়ার্ড (অন্তত ৬ অক্ষর)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                                <input className={input} type="password" autoComplete="new-password" placeholder="আবার নতুন পাসওয়ার্ড" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} />
                                <button onClick={changePassword} disabled={Boolean(busy)} className={btn}>{busy === 'pw' ? 'বদলানো হচ্ছে...' : 'পাসওয়ার্ড বদলান'}</button>
                                <p className="text-xs text-slate-500">এখনকার পাসওয়ার্ড মনে না থাকলে লগআউট করে &quot;পাসওয়ার্ড ভুলে গেছি&quot; দিন।</p>
                            </div>
                        ) : (
                            <div className={`${card} p-5 text-sm text-slate-500`}>
                                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100"><KeyRound size={17} className="text-emerald-500" /> লগইন পদ্ধতি</h3>
                                <p className="mt-2">আপনি Google দিয়ে লগইন করেছেন, তাই আলাদা পাসওয়ার্ড লাগে না।</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
