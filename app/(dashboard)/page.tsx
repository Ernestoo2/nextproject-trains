'use client'
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import PageRoute from "./_components/page-route/page";
import BackImageUi from "./_components/back-image/page";
import Image from "next/image";
import image from "../../../public/Assets/Train.png";
import NewsletterPage from "./_components/newsletter/page";
import Review from "./_components/review-page/page";
import BookingPage from "./_components/booking-interface/page";
export const dynamic = 'force-dynamic';

export default async function DashboardContent() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

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