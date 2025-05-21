import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/auth/next-auth";
import { cookies } from "next/headers"; 
import HeaderPage from "@/_components/Header/page";
import FooterPage from "@/_components/Footer";
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Get cookies first
    const cookieStore = await cookies();
    
    // Then get session
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/auth/login");
    }

    return (
      <div className="min-h-screen flex flex-col">
        <HeaderPage/>
        <main className="flex-grow">{children}</main>
       <FooterPage/>
      </div>
    );
  } catch (error) {
    console.error("Error in dashboard layout:", error);
    redirect("/auth/login");
  }
}
