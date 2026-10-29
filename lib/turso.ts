import { createClient } from '@libsql/client';

// প্রশ্ন আর ছাত্রদের ডাটার সেই একই DB (medical-adqlive), চার প্ল্যাটফর্মের
export const turso = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://dummy-url-for-build.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN,
});
