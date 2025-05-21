import { Suspense } from 'react';
import Header1Ui from "../../_components/Header/Header1Ui";
import FooterPage from "../../_components/Footer";
import DashboardLoading from './loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-16" />}>
        <Header1Ui />
      </Suspense>
      <main className="">
        <Suspense fallback={<DashboardLoading />}>
          {children}
        </Suspense>
      </main>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32" />}>
        <FooterPage />
      </Suspense>
    </div>
  );


}
