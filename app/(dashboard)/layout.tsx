import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/auth/next-auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get headers for session
  const headersList = headers();
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/auth/login");
    }

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    );
  } catch (error) {
    console.error("Error in dashboard layout:", error);
    redirect("/auth/login");
  }
}
