import Footer from '@/app/_components/Footer/_components/Footer';
import Header1Ui from '@/app/_components/Header/Header1Ui';
import React from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow">
        {children}
      </main>
      
    </div>
  );
} 