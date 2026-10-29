import { NextRequest, NextResponse } from 'next/server';
import { fail, PLATFORMS, sessionUser } from '@/lib/session';
import { turso } from '@/lib/turso';

// প্রোফাইল: নাম, ফোন/ইমেইল, চার প্ল্যাটফর্মের হিসাব, বটের সাথে যুক্ত কিনা
export async function GET(req: NextRequest) {
    const user = await sessionUser(req);
    if (!user) return fail('লগইন করুন', 401);
    const [u, scores, bot] = await turso.batch([
        { sql: 'SELECT name, email, phone, created_at FROM site_users WHERE uid = ?', args: [user.uid] },
        { sql: 'SELECT platform, attempted, correct, score FROM site_scores WHERE uid = ?', args: [user.uid] },
        { sql: "SELECT 1 FROM hermes_site_links WHERE site_uid = ? LIMIT 1", args: [user.uid] },
    ], 'read');
    const row = u.rows[0] || {};
    const by = Object.fromEntries(scores.rows.map((s) => [String(s.platform), {
        attempted: Number(s.attempted) || 0, correct: Number(s.correct) || 0, score: Number(s.score) || 0 }]));
    return NextResponse.json({
        success: true,
        profile: { uid: user.uid, name: String(row.name || user.name || ''), email: String(row.email || user.email || ''),
                   phone: String(row.phone || user.phone || ''), since: String(row.created_at || ''), botLinked: bot.rows.length > 0 },
        platforms: PLATFORMS.map((p) => ({ ...p, ...(by[p.id] || { attempted: 0, correct: 0, score: 0 }) })),
    });
}

// body: { name }
export async function PATCH(req: NextRequest) {
    const user = await sessionUser(req);
    if (!user) return fail('লগইন করুন', 401);
    const { name } = await req.json().catch(() => ({}));
    if (typeof name !== 'string' || name.trim().length < 2) return fail('নাম লিখুন');
    await turso.execute({ sql: 'UPDATE site_users SET name = ?, updated_at = ? WHERE uid = ?', args: [name.trim().slice(0, 60), new Date().toISOString(), user.uid] });
    return NextResponse.json({ success: true });
}
