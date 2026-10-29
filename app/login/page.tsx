'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ConfirmationResult,
    EmailAuthProvider,
    GoogleAuthProvider,
    RecaptchaVerifier,
    User,
    linkWithCredential,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
    updatePassword,
    updateProfile,
} from 'firebase/auth';
import { ArrowRight, KeyRound, Loader2, Lock, Phone, User as UserIcon } from 'lucide-react';
import { auth, phoneEmail, toE164 } from '@/lib/firebase';

// লগইন: ফোন নম্বর + পাসওয়ার্ড (OTP ছাড়া) বা Google।
// নতুন অ্যাকাউন্ট আর পাসওয়ার্ড ভুলে গেলে: ফোনে একবার OTP, তারপর নিজের পাসওয়ার্ড।
// লগইন শেষে .admcq.com এর session cookie, তাই med, ka, kha, eng সব সাইটে একসাথে লগইন।

type Mode = 'login' | 'register' | 'forgot';
type Step = 'phone' | 'code' | 'password';

const BN = (s: string) => s.replace(/[০-৯]/g, (x) => String('০১২৩৪৫৬৭৮৯'.indexOf(x)));

function authError(err: unknown) {
    const c = String((err as { code?: string })?.code || '');
    const msg: Record<string, string> = {
        'auth/invalid-credential': 'ফোন নম্বর বা পাসওয়ার্ড ভুল।',
        'auth/wrong-password': 'ফোন নম্বর বা পাসওয়ার্ড ভুল।',
        'auth/user-not-found': 'ফোন নম্বর বা পাসওয়ার্ড ভুল।',
        'auth/invalid-phone-number': 'ফোন নম্বরটা ঠিক নেই।',
        'auth/invalid-verification-code': 'কোডটা ভুল হয়েছে।',
        'auth/code-expired': 'কোডের মেয়াদ শেষ। নতুন কোড নিন।',
        'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
        'auth/quota-exceeded': 'আজকের SMS এর সীমা শেষ। পরে চেষ্টা করুন।',
        'auth/weak-password': 'পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।',
        'auth/requires-recent-login': 'আবার OTP দিয়ে যাচাই করুন।',
        'auth/popup-closed-by-user': 'Google এর জানালাটা বন্ধ হয়ে গেছে।',
        'auth/network-request-failed': 'ইন্টারনেট সংযোগে সমস্যা।',
        'auth/operation-not-allowed': 'এই লগইন পদ্ধতি এখনো চালু হয়নি।',
    };
    console.error('Auth error:', err);
    return `${msg[c] || 'কাজটা করা যায়নি। আবার চেষ্টা করুন।'}${c ? ` (${c})` : ''}`;
}

const input = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm';
const button = 'w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70 text-sm cursor-pointer';
const Field = ({ icon: Icon, label, ...props }: { icon: typeof Phone; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Icon size={18} /></div>
            <input {...props} className={input} required />
        </div>
    </div>
);
const Submit = ({ text, loading }: { text: string; loading: boolean }) => (
    <button type="submit" disabled={loading} className={button}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <>{text} <ArrowRight size={16} /></>}
    </button>
);


/** লগইনের পরে শুধু admcq.com বা এর subdomain এ ফেরা যায় */
function safeNext(next: string) {
    try {
        const u = new URL(next, window.location.origin);
        if (u.hostname === 'admcq.com' || u.hostname.endsWith('.admcq.com') || u.origin === window.location.origin) return u.toString();
    } catch { /* ভুল ঠিকানা */ }
    return '/profile';
}

function LoginInner() {
    const next = useSearchParams().get('next') || '/profile';
    const [mode, setMode] = useState<Mode>('login');
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [needName, setNeedName] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const confirmation = useRef<ConfirmationResult | null>(null);
    const recaptcha = useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const switchMode = (m: Mode) => {
        setMode(m);
        setStep('phone');
        setError('');
        setCode('');
        setPassword('');
        setPassword2('');
    };

    // Firebase এর লগইন থেকে .admcq.com এর session cookie, তারপর যেখান থেকে এসেছিল সেখানে
    const finish = async (user: User, displayName = '') => {
        const res = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: await user.getIdToken(true), name: displayName }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'লগইন রাখা গেল না');
        window.location.href = safeNext(next);
    };

    const run = async (fn: () => Promise<void>) => {
        setError('');
        setLoading(true);
        try {
            await fn();
        } catch (err) {
            setError(err instanceof Error && !(err as { code?: string }).code ? err.message : authError(err));
        } finally {
            setLoading(false);
        }
    };

    const login = (e: React.FormEvent) => {
        e.preventDefault();
        run(async () => {
            const number = toE164(phone);
            if (!number) throw new Error('ফোন নম্বরটা ঠিক নেই। ০১ দিয়ে ১১ অঙ্কের নম্বর দিন।');
            const cred = await signInWithEmailAndPassword(auth, phoneEmail(number), password);
            await finish(cred.user);
        });
    };

    const sendCode = (e?: React.FormEvent) => {
        e?.preventDefault();
        run(async () => {
            const number = toE164(phone);
            if (!number) throw new Error('ফোন নম্বরটা ঠিক নেই। ০১ দিয়ে ১১ অঙ্কের নম্বর দিন।');
            try {
                recaptcha.current ||= new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
                confirmation.current = await signInWithPhoneNumber(auth, number, recaptcha.current);
            } catch (err) {
                recaptcha.current?.clear();
                recaptcha.current = null;
                throw err;
            }
            setStep('code');
            setCode('');
            setCooldown(60);
        });
    };

    const verifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        run(async () => {
            if (!confirmation.current) return setStep('phone');
            const cred = await confirmation.current.confirm(BN(code).trim());
            setNeedName(!cred.user.displayName);
            setStep('password');
        });
    };

    // OTP এর পরে পাসওয়ার্ড: নতুন হলে ফোনের সাথে জুড়ে দিই, আগে থেকে থাকলে বদলাই
    const savePassword = (e: React.FormEvent) => {
        e.preventDefault();
        run(async () => {
            const user = auth.currentUser;
            if (!user?.phoneNumber) return setStep('phone');
            if (password.length < 6) throw new Error('পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।');
            if (password !== password2) throw new Error('দুই জায়গার পাসওয়ার্ড মেলেনি।');
            if (needName && name.trim().length < 2) throw new Error('আপনার নাম লিখুন।');
            const hasPassword = user.providerData.some((p) => p.providerId === 'password');
            if (hasPassword) await updatePassword(user, password);
            else await linkWithCredential(user, EmailAuthProvider.credential(phoneEmail(user.phoneNumber), password));
            if (needName) await updateProfile(user, { displayName: name.trim() });
            await finish(user, name.trim());
        });
    };

    const google = () => run(async () => {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        await finish(cred.user);
    });

    const title = mode === 'login' ? 'লগইন করুন' : mode === 'register' ? 'নতুন অ্যাকাউন্ট' : 'পাসওয়ার্ড ভুলে গেছেন?';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070b14] text-slate-800 dark:text-slate-100">
            <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-7 sm:p-9">
                <Link href="/" className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-black text-black text-xl">A</div>
                    <span className="font-extrabold text-2xl">Ad<span className="text-emerald-500">MCQ</span></span>
                </Link>
                <h1 className="text-center text-xl font-black mb-1">{title}</h1>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-6">একটা অ্যাকাউন্টে মেডিকেল, ভার্সিটি ক, খ আর ইঞ্জিনিয়ারিং</p>

                {error && <div className="mb-5 p-3 rounded-2xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 text-center">{error}</div>}

                {mode === 'login' && (
                    <form onSubmit={login} className="space-y-4">
                        <Field icon={Phone} label="ফোন নম্বর" type="tel" inputMode="numeric" autoComplete="tel" placeholder="01712345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Field icon={Lock} label="পাসওয়ার্ড" type="password" autoComplete="current-password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Submit loading={loading} text="লগইন" />
                        <div className="flex justify-between text-xs px-1">
                            <button type="button" onClick={() => switchMode('forgot')} className="text-slate-500 hover:text-emerald-600 cursor-pointer">পাসওয়ার্ড ভুলে গেছি</button>
                            <button type="button" onClick={() => switchMode('register')} className="font-bold text-emerald-600 cursor-pointer">নতুন অ্যাকাউন্ট খুলুন</button>
                        </div>
                    </form>
                )}

                {mode !== 'login' && step === 'phone' && (
                    <form onSubmit={sendCode} className="space-y-4">
                        <Field icon={Phone} label="ফোন নম্বর" type="tel" inputMode="numeric" autoComplete="tel" placeholder="01712345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Submit loading={loading} text="যাচাইয়ের কোড পাঠান" />
                        <p className="text-[11px] text-center text-slate-500">নম্বরে একবার ৬ অঙ্কের কোড SMS এ যাবে। পরে লগইনে আর কোড লাগবে না।</p>
                    </form>
                )}

                {mode !== 'login' && step === 'code' && (
                    <form onSubmit={verifyCode} className="space-y-4">
                        <Field icon={KeyRound} label="SMS এ আসা কোড" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
                        <Submit loading={loading} text="যাচাই করুন" />
                        <div className="flex justify-between text-xs px-1 text-slate-500">
                            <button type="button" onClick={() => setStep('phone')} className="hover:text-emerald-600 cursor-pointer">নম্বর বদলান</button>
                            <button type="button" disabled={cooldown > 0 || loading} onClick={() => sendCode()} className="hover:text-emerald-600 disabled:opacity-50 cursor-pointer">
                                {cooldown > 0 ? `আবার কোড (${cooldown}s)` : 'আবার কোড পাঠান'}
                            </button>
                        </div>
                    </form>
                )}

                {mode !== 'login' && step === 'password' && (
                    <form onSubmit={savePassword} className="space-y-4">
                        <p className="text-xs text-center text-emerald-600 font-bold">✅ নম্বর যাচাই হয়েছে, এখন পাসওয়ার্ড দিন</p>
                        {needName && <Field icon={UserIcon} label="আপনার নাম (লিডারবোর্ডে দেখাবে)" type="text" autoComplete="name" placeholder="যেমন: রাফি আহমেদ" value={name} onChange={(e) => setName(e.target.value)} />}
                        <Field icon={Lock} label={mode === 'register' ? 'পাসওয়ার্ড (অন্তত ৬ অক্ষর)' : 'নতুন পাসওয়ার্ড'} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Field icon={Lock} label="আবার পাসওয়ার্ড" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                        <Submit loading={loading} text={mode === 'register' ? 'অ্যাকাউন্ট খুলুন' : 'পাসওয়ার্ড সেভ করুন'} />
                    </form>
                )}

                {mode !== 'login' && step !== 'password' && (
                    <button type="button" onClick={() => switchMode('login')} className="mt-4 w-full text-xs text-slate-500 hover:text-emerald-600 cursor-pointer">← আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন</button>
                )}
                <div id="recaptcha-container" />

                {step !== 'password' && (
                    <>
                        <div className="my-5 flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                            <span className="text-xs text-slate-400 font-semibold">অথবা</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <button onClick={google} disabled={loading} className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 font-bold text-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google দিয়ে লগইন
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginInner />
        </Suspense>
    );
}
