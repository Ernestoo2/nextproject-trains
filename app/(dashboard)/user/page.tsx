'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HeaderUi from '../../_components/Header/HeaderUi';
import FooterPage from '@/app/_components/Footer';
import Account from './_components/Account';
import Tickets from './_components/Tickets';
import Payment from './_components/Payment';
import Image from 'next/image';

export default function UserPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('account');

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Please sign in to view your account.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <HeaderUi />
            <main className="flex-grow">
                {/* Profile Header */}
                <div className="w-full mx-auto relative rounded-lg bg-white">
                    <div className="w-full h-48 bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg"></div>
                    <div className="flex flex-col justify-center items-center -mt-20 mx-auto">
                        <div className="w-36 h-36 overflow-hidden bg-gray-300 border-4 border-white rounded-full">
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    width={144}
                                    height={144}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 text-4xl font-bold">
                                    {session.user.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <h1 className="mt-4 text-xl font-bold">{session.user.name}</h1>
                        <p className="text-gray-600">{session.user.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mt-8 space-x-2 px-4">
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            activeTab === 'account'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Account
                    </button>
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            activeTab === 'tickets'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Tickets/Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                            activeTab === 'payment'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        Payment Methods
                    </button>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto p-6 mt-6">
                    {activeTab === 'account' && <Account />}
                    {activeTab === 'tickets' && <Tickets />}
                    {activeTab === 'payment' && <Payment />}
                </div>
            </main>
            <FooterPage />
        </div>
    );
} 