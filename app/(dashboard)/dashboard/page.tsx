'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageRoute from "../_components/page-route/_components/rout-selectors/page";
import BookingPage from "../_components/booking-interface/page";
import BackImageUi from "../_components/back-image/page";
import image from "../../../public/Assets/Train.png";
import Review from "../_components/review-page/page";
import Image from "next/image";
import NewsletterPage from "../_components/newsletter/page";

export const dynamic = 'force-dynamic';

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  return (
    <div>
      <PageRoute />
      <BackImageUi />
      <BookingPage />
      <Review />
      <Image className="w-full h-auto" src={image} alt="image for trains" />
      <NewsletterPage />
    </div>
  );
}