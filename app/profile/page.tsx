'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { ArrowRight, Check, Copy, Loader2, LogOut, Send } from 'lucide-react';
import { auth, phoneEmail } from '@/lib/firebase';

// একটাই প্রোফাইল: নাম, পাসওয়ার্ড, চার প্ল্যাটফর্মের হিসাব, মাছরাঙা বটের সাথে জোড়া

type Platform = { id: string; name: string; url: string; attempted: number; correct: number; score: number };
type Profile = { uid: string; name: string; email: string; phone: string; since: string; botLinked: boolean };

const bn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const card = 'rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5';
const input = 'w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-sm focus:outline-none focus:border-emerald-500';
const btn = 'px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-60 cursor-pointer';

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);
    const [pw, setPw] = useState({ current: '', next: '', again: '' });
    const [code, setCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/profile', { cache: 'no-store' }).then(async (r) => {
            if (r.status === 401) {
                window.location.href = '/login?next=/profile';
                return;
            }
            const d = await r.json().catch(() => ({}));
            if (d.success) {
                setProfile(d.profile);
                setPlatforms(d.platforms);
                setName(d.profile.name);
            } else setMsg(d.error || `সার্ভার ${r.status}`);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const saveName = async () => {
        setBusy(true);
        setMsg('');
        const r = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        const d = await r.json();
        if (d.success && auth.currentUser) await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => null);
        setMsg(d.success ? '✅ নাম সেভ হয়েছে' : d.error);
        setBusy(false);
    };

    const changePassword = async () => {
        setMsg('');
        const user = auth.currentUser;
        if (!user || !profile?.phone) return setMsg('পাসওয়ার্ড বদলাতে আবার লগইন করুন।');
        if (pw.next.length < 6) return setMsg('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।');
        if (pw.next !== pw.again) return setMsg('দুই জায়গার নতুন পাসওয়ার্ড মেলেনি।');
        setBusy(true);
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(phoneEmail(profile.phone), pw.current));
            await updatePassword(user, pw.next);
            setPw({ current: '', next: '', again: '' });
            setMsg('✅ পাসওয়ার্ড বদলানো হয়েছে, চার সাইটেই নতুনটা চলবে');
        } catch (err) {
            const c = String((err as { code?: string })?.code || '');
            setMsg(c === 'auth/invalid-credential' || c === 'auth/wrong-password' ? 'এখনকার পাসওয়ার্ড ভুল।' : `বদলানো যায়নি (${c})`);
        } finally {
            setBusy(false);
        }
    };

    const linkBot = async () => {
        const d = await (await fetch('/api/link-code', { method: 'POST' })).json();
        if (d.success) setCode(d.code);
    };

    const logout = async () => {
        await Promise.allSettled([signOut(auth), fetch('/api/session', { method: 'DELETE' })]);
        window.location.href = '/';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]"><Loader2 className="animate-spin text-emerald-500" /></div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center text-sm">প্রোফাইল লোড করা যায়নি{msg ? ` (${msg})` : ''}। <Link href="/login" className="text-emerald-600 ml-1">লগইন</Link></div>;

    const isPhoneAccount = Boolean(profile.phone);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-5">
                <header className="flex items-center justify-between">
                    <Link href="/" className="font-extrabold text-2xl">Ad<span className="text-emerald-500">MCQ</span></Link>
                    <button onClick={logout} className="flex items-center gap-1.5 text-sm text-rose-500 font-bold cursor-pointer"><LogOut size={16} /> লগআউট</button>
                </header>

                <section className={card}>
                    <h1 className="text-xl font-black">{profile.name || 'আপনার প্রোফাইল'}</h1>
                    <p className="text-sm text-slate-500 mt-1">{profile.phone ? bn(profile.phone.replace('+88', '')) : profile.email}</p>
                    {msg && <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{msg}</p>}
                </section>

                <section>
                    <h2 className="font-black mb-3">📚 আপনার প্ল্যাটফর্ম</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {platforms.map((p) => (
                            <a key={p.id} href={p.url} className={`${card} hover:border-emerald-500 transition-colors block`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{p.name}</span>
                                    <ArrowRight size={16} className="text-emerald-500" />
                                </div>
                                <div className="mt-3 flex gap-4 text-sm text-slate-500">
                                    <span>স্কোর <b className="text-slate-800 dark:text-slate-100">{bn(Number(p.score.toFixed(2)))}</b></span>
                                    <span>উত্তর {bn(p.attempted)}</span>
                                    <span>সঠিক {p.attempted ? bn(Math.round((p.correct * 100) / p.attempted)) : '০'}%</span>
                                </div>
                            </a>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">একবার লগইনেই চার সাইটে ঢোকা যায়। প্রতিটা সাইটের Analysis আলাদা।</p>
                </section>

                <section className={`${card} space-y-3`}>
                    <h2 className="font-black">✏️ নাম</h2>
                    <div className="flex gap-2">
                        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" />
                        <button onClick={saveName} disabled={busy} className={btn}>সেভ</button>
                    </div>
                </section>

                {isPhoneAccount && (
                    <section className={`${card} space-y-3`}>
                        <h2 className="font-black">🔒 পাসওয়ার্ড বদলান</h2>
                        <input className={input} type="password" autoComplete="current-password" placeholder="এখনকার পাসওয়ার্ড" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                        <input className={input} type="password" autoComplete="new-password" placeholder="নতুন পাসওয়ার্ড (অন্তত ৬ অক্ষর)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                        <input className={input} type="password" autoComplete="new-password" placeholder="আবার নতুন পাসওয়ার্ড" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} />
                        <button onClick={changePassword} disabled={busy} className={btn}>বদলান</button>
                        <p className="text-xs text-slate-500">এখনকার পাসওয়ার্ড মনে না থাকলে লগআউট করে "পাসওয়ার্ড ভুলে গেছি" দিন।</p>
                    </section>
                )}

                <section className={`${card} space-y-3`}>
                    <h2 className="font-black">🤖 মাছরাঙা বট (Telegram)</h2>
                    {profile.botLinked && !code && <p className="text-sm text-emerald-600">✅ বটের সাথে যুক্ত আছে। বটে /mode দিয়ে প্ল্যাটফর্ম বদলানো যায়।</p>}
                    {code ? (
                        <div className="space-y-2 text-sm">
                            <p>১৫ মিনিটের মধ্যে বটে লিখুন:</p>
                            <button onClick={() => { navigator.clipboard.writeText(`/site ${code}`); setCopied(true); }}
                                className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono font-bold cursor-pointer">
                                /site {code} {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                            <a href="https://t.me/Machranga_ai_bot" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 rounded-xl bg-sky-600 text-white font-bold">বট খুলুন</a>
                        </div>
                    ) : (
                        <button onClick={linkBot} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold cursor-pointer">
                            <Send size={15} /> {profile.botLinked ? 'আবার যুক্ত করুন' : 'বটের সাথে যুক্ত করুন'}
                        </button>
                    )}
                </section>
            </div>
        </div>
    );
}
