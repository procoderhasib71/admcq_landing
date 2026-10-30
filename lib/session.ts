import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export const SESSION_COOKIE = '__session';
export const ROOT_DOMAIN = 'admcq.com';
export const SESSION_DAYS = 14;

export type SessionUser = { uid: string; email: string; name: string; phone: string };

const hostOf = (req: NextRequest) => (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0];

/** .admcq.com এ বসালে med/ka/kha/eng সব সাইট একই লগইন পায় */
export function cookieOptions(req: NextRequest, maxAgeSec: number) {
    const onDomain = hostOf(req).endsWith(ROOT_DOMAIN);
    return { httpOnly: true, secure: onDomain, sameSite: 'lax' as const, path: '/', maxAge: maxAgeSec,
             ...(onDomain ? { domain: `.${ROOT_DOMAIN}` } : {}) };
}

function toUser(t: { uid: string; email?: string; name?: unknown; phone_number?: string }): SessionUser {
    const email = (t.email || '').toLowerCase();
    const synthetic = email.endsWith('@phone.admcq.com');   // ফোন-পাসওয়ার্ডের লুকানো ইমেইল
    return { uid: t.uid, email: synthetic ? '' : email, name: String(t.name || ''),
             phone: t.phone_number || (synthetic ? `+${email.split('@')[0]}` : '') };
}

export async function sessionUser(req: NextRequest): Promise<SessionUser | null> {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) return null;
    try {
        return toUser(await adminAuth.verifySessionCookie(cookie, true));
    } catch {
        return null;
    }
}

export async function userFromIdToken(idToken: string): Promise<SessionUser> {
    return toUser(await adminAuth.verifyIdToken(idToken));
}

export const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });
