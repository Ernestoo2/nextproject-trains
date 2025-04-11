// app/(dashboard)/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user) {
            router.push('/user');
        }
    }, [session, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );
}
