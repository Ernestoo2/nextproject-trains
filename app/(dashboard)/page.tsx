"use client";
import PageRoute from "./_components/page-route/page";
import BackImageUi from "./_components/back-image/page";
import Image from "next/image";
import image from "../../public/Assets/Train.png";
import NewsletterPage from "./_components/newsletter/page";
import Review from "./_components/review-page/page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BookingPage from "./_components/booking-interface/page";
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';


export default function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  redirect('/auth/sign-in');
  
  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login"); // Redirect to login page without route group parentheses
    }
  }, [session, router]);

  return (
    <div>
      <PageRoute />
      <BackImageUi />
      <BookingPage />
      <Review />
      <Image src={image} alt="image for trains" />
      <NewsletterPage />
    </div>
  );
}