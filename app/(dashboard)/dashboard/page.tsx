'use client'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PageRoute from "../_components/page-route/_components/rout-selectors/page";
import BookingPage from "../_components/booking-interface/page";
import BackImageUi from "../_components/back-image/page";
import image from "../../../public/Assets/Train.png";
import Review from "../_components/review-page/page";
import Image from "next/image";
import NewsletterPage from "../_components/newsletter/page";
 
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
      <Image className="w-full h-auto" src={image} alt="image for trains" />
      <NewsletterPage />
    </div>
  );
}