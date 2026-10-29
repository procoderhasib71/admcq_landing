'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// হেডারের বোতাম: লগইন থাকলে প্রোফাইল, না থাকলে লগইন
export default function AccountButton() {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/session', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => setName(d.success ? d.user?.name || 'প্রোফাইল' : null))
            .catch(() => setName(null));
    }, []);

    return (
        <Link
            href={name ? '/profile' : '/login'}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-500/20 shrink-0 max-w-[9rem] truncate"
        >
            {name ? `👤 ${name}` : 'লগইন / রেজিস্টার'}
        </Link>
    );
}
