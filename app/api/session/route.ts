import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { SESSION_COOKIE, SESSION_DAYS, cookieOptions, fail, sessionUser, userFromIdToken } from '@/lib/session';
import { turso } from '@/lib/turso';

// কোন ধাপে আটকাল বোঝার জন্য error এর কোড বা প্রথম অংশ (টোকেন বা key এতে থাকে না)
const errCode = (e: unknown) => {
    const x = e as { code?: string; message?: string };
    return String(x?.message || x?.code || 'unknown').slice(0, 120);
};

// লগইনের পরে ব্রাউজার Firebase এর টোকেন পাঠায়, সার্ভার ১৪ দিনের session cookie বসায় (.admcq.com, চার সাইটে)
export async function POST(req: NextRequest) {
    const { idToken, name } = await req.json().catch(() => ({}));
    if (!idToken) return fail('টোকেন নেই');
    let user;
    try {
        user = await userFromIdToken(String(idToken));
    } catch {
        return fail('লগইন যাচাই হয়নি', 401);
    }
    const cleanName = String(name || user.name || '').trim().slice(0, 60);
    const now = new Date().toISOString();
    try {
        await turso.execute({
            sql: `INSERT INTO site_users (uid, email, name, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT(uid) DO UPDATE SET email = CASE WHEN excluded.email <> '' THEN excluded.email ELSE site_users.email END,
                  name = CASE WHEN excluded.name <> '' AND COALESCE(site_users.name, '') = '' THEN excluded.name ELSE site_users.name END,
                  phone = COALESCE(NULLIF(excluded.phone, ''), site_users.phone), updated_at = excluded.updated_at`,
            args: [user.uid, user.email, cleanName, user.phone, now, now],
        });
    } catch (e) {
        console.error('site_users upsert failed', e);
        return fail(`ডাটাবেসে লেখা গেল না (${errCode(e)})`, 500);
    }
    let cookie;
    try {
        cookie = await adminAuth.createSessionCookie(String(idToken), { expiresIn: SESSION_DAYS * 24 * 3600 * 1000 });
    } catch (e) {
        console.error('createSessionCookie failed', e);
        return fail(`লগইন রাখা গেল না (${errCode(e)})`, 500);
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, cookie, cookieOptions(req, SESSION_DAYS * 24 * 3600));
    return res;
}

export async function GET(req: NextRequest) {
    const user = await sessionUser(req);
    return NextResponse.json({ success: Boolean(user), user });
}

// লগআউট: cookie মোছা আর সব ডিভাইসের session বাতিল
export async function DELETE(req: NextRequest) {
    const user = await sessionUser(req);
    if (user) await adminAuth.revokeRefreshTokens(user.uid).catch(() => null);
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, '', cookieOptions(req, 0));
    return res;
}
