'use client';

import { useCallback, useEffect, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { auth, phoneEmail } from '@/lib/firebase';
import { COURSES, type CourseId } from '@/lib/courses';

// প্রোফাইল পেজ আর হেডারের slide মেনু দুটোই এটা দিয়ে চলে: লোড, কোর্স নেওয়া, নাম, পাসওয়ার্ড, বট, লগআউট

export type Platform = { id: CourseId; name: string; url: string; enrolled: boolean; enrolledAt: string; attempted: number; correct: number; score: number };
export type Profile = { uid: string; name: string; email: string; phone: string; since: string; botLinked: boolean };
export type Msg = { ok: boolean; text: string } | null;

export function useAccount({ redirectIfLoggedOut = false } = {}) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [status, setStatus] = useState<'loading' | 'in' | 'out' | 'error'>('loading');
    const [msg, setMsg] = useState<Msg>(null);
    const [busy, setBusy] = useState('');

    const load = useCallback(async () => {
        const r = await fetch('/api/profile', { cache: 'no-store' }).catch(() => null);
        if (r?.status === 401) {
            if (redirectIfLoggedOut) window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            setStatus('out');
            return null;
        }
        const d = r ? await r.json().catch(() => ({})) : {};
        if (!d.success) {
            setMsg({ ok: false, text: d.error || `সার্ভার ${r?.status ?? 'পাওয়া যায়নি'}` });
            setStatus('error');
            return null;
        }
        setProfile(d.profile);
        setPlatforms(d.platforms);
        setStatus('in');
        return d as { profile: Profile; platforms: Platform[] };
    }, [redirectIfLoggedOut]);

    useEffect(() => {
        let alive = true;
        Promise.resolve().then(() => { if (alive) load(); });
        return () => { alive = false; };
    }, [load]);

    const enroll = async (id: CourseId) => {
        setBusy(`enroll-${id}`);
        const d = await (await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: id }) })).json().catch(() => ({}));
        if (d.success) {
            await load();
            setMsg({ ok: true, text: `${COURSES.find((c) => c.id === id)?.name} কোর্সটি আপনার প্রোফাইলে যুক্ত হয়েছে` });
        } else setMsg({ ok: false, text: d.error || 'কোর্স নেওয়া যায়নি' });
        setBusy('');
        return Boolean(d.success);
    };

    const saveName = async (name: string) => {
        setBusy('name');
        const d = await (await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })).json().catch(() => ({}));
        if (d.success) {
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => null);
            setProfile((p) => (p ? { ...p, name: name.trim() } : p));
        }
        setMsg(d.success ? { ok: true, text: 'নাম সেভ হয়েছে' } : { ok: false, text: d.error || 'সেভ হয়নি' });
        setBusy('');
    };

    const changePassword = async (current: string, next: string, again: string) => {
        const user = auth.currentUser;
        if (!user || !profile?.phone) { setMsg({ ok: false, text: 'পাসওয়ার্ড বদলাতে লগআউট করে আবার লগইন করুন।' }); return false; }
        if (next.length < 6) { setMsg({ ok: false, text: 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।' }); return false; }
        if (next !== again) { setMsg({ ok: false, text: 'দুই জায়গার নতুন পাসওয়ার্ড মেলেনি।' }); return false; }
        setBusy('pw');
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(phoneEmail(profile.phone), current));
            await updatePassword(user, next);
            setMsg({ ok: true, text: 'পাসওয়ার্ড বদলানো হয়েছে, সব কোর্সে নতুনটা চলবে' });
            return true;
        } catch (err) {
            const c = String((err as { code?: string })?.code || '');
            setMsg({ ok: false, text: c === 'auth/invalid-credential' || c === 'auth/wrong-password' ? 'এখনকার পাসওয়ার্ড ভুল।' : `বদলানো যায়নি (${c})` });
            return false;
        } finally {
            setBusy('');
        }
    };

    const linkCode = async () => {
        const d = await (await fetch('/api/link-code', { method: 'POST' })).json().catch(() => ({}));
        if (!d.success) setMsg({ ok: false, text: d.error || 'কোড বানানো যায়নি' });
        return d.success ? String(d.code) : '';
    };

    const logout = async () => {
        await Promise.allSettled([signOut(auth), fetch('/api/session', { method: 'DELETE' })]);
        window.location.assign('/');
    };

    return { profile, platforms, status, msg, setMsg, busy, load, enroll, saveName, changePassword, linkCode, logout };
}

export type Account = ReturnType<typeof useAccount>;

export const bn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
export const pct = (p: { attempted: number; correct: number }) => (p.attempted ? Math.round((p.correct * 100) / p.attempted) : 0);
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';
export const showDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
};
