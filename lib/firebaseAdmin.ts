import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// session cookie বানাতে (createSessionCookie) Google এর অনুমতি লাগে: App Hosting এ নিজের অ্যাকাউন্ট দিয়ে চলে,
// অন্য জায়গায় FIREBASE_SERVICE_ACCOUNT_BASE64 (service account JSON, base64) দিতে হয়।
function init() {
    const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (encoded) {
        const sa = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
        return initializeApp({ credential: cert(sa), projectId: sa.project_id });
    }
    return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
}

export const adminAuth = getAuth(getApps()[0] ?? init());
