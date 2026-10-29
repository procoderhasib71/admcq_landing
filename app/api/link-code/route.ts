import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { fail, sessionUser } from '@/lib/session';
import { turso } from '@/lib/turso';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // O/0, I/1/L বাদ
const TTL_MIN = 15;

// মাছরাঙা বটের সাথে জোড়ার কোড; বটে লিখবে /site কোড (চার প্ল্যাটফর্মেই কাজ করে)
export async function POST(req: NextRequest) {
    const user = await sessionUser(req);
    if (!user) return fail('লগইন করুন', 401);
    const code = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    await turso.batch([
        { sql: 'DELETE FROM site_link_codes WHERE uid = ? OR expires_at < ?', args: [user.uid, Date.now()] },
        { sql: 'INSERT INTO site_link_codes (code, uid, email, name, expires_at) VALUES (?, ?, ?, ?, ?)',
          args: [code, user.uid, user.email, user.name, Date.now() + TTL_MIN * 60 * 1000] },
    ], 'write');
    return NextResponse.json({ success: true, code, minutes: TTL_MIN });
}
