import { NextRequest, NextResponse } from 'next/server';
import { isCourse } from '@/lib/courses';
import { fail, sessionUser } from '@/lib/session';
import { turso } from '@/lib/turso';

// কোর্স নেওয়া (এখন বিনামূল্যে); body: { platform }
export async function POST(req: NextRequest) {
    const user = await sessionUser(req);
    if (!user) return fail('লগইন করুন', 401);
    const { platform } = await req.json().catch(() => ({}));
    if (!isCourse(platform)) return fail('কোর্স পাওয়া যায়নি');
    await turso.execute({
        sql: 'INSERT OR IGNORE INTO site_enrollments (uid, platform, created_at) VALUES (?, ?, ?)',
        args: [user.uid, platform, new Date().toISOString()],
    });
    return NextResponse.json({ success: true });
}
