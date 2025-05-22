import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react"; 
import BookingPage from "../_components/booking-interface/page";
import BackImageUi from "../_components/back-image/page";
import image from "../../../public/Assets/Train.png";
import Review from "../_components/review-page/page";
import Image from "next/image";
import NewsletterPage from "../_components/newsletter/page";  
import RoutePage from "./page-route/page";
 
export const dynamic = 'force-dynamic';

export default async function DashboardContent() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login'); 
  }

  return (
    <div>
      <Suspense fallback={<div>Loading navigation...</div>}>
        <RoutePage />
      </Suspense> 
      
      <Suspense fallback={<div>Loading background...</div>}>
        <BackImageUi />
      </Suspense>
      
      <Suspense fallback={<div>Loading booking interface...</div>}>
        <BookingPage />
      </Suspense>
      
      <Suspense fallback={<div>Loading reviews...</div>}>
        <Review />
      </Suspense>
      
      <Image className="w-full h-auto" src={image} alt="image for trains" />
      
      <Suspense fallback={<div>Loading newsletter...</div>}>
        <NewsletterPage />
      </Suspense>
    </div>
  );
}