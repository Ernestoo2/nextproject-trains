'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import PageRoute from "../_components/page-route/_components/rout-selectors/page";
import BookingPage from "../_components/booking-interface/page";
import BackImageUi from "../_components/back-image/page";
import image from "../../../public/Assets/Train.png";
import Review from "../_components/review-page/page";
import Image from "next/image";
import NewsletterPage from "../_components/newsletter/page";
import DashboardLoading from "./loading";

export const dynamic = 'force-dynamic';

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);
  if (status === 'loading') {
    return <DashboardLoading />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div>
      <Suspense fallback={<DashboardLoading />}>
        <PageRoute />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-[400px]" />}>
        <BackImageUi />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-[300px]" />}>
        <BookingPage />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-[400px]" />}>
        <Review />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-[300px]" />}>
        <Image className="w-full h-auto" src={image} alt="image for trains" />
      </Suspense>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-[200px]" />}>
        <NewsletterPage />
      </Suspense>
    </div>
  );
}