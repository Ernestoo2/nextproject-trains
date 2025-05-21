import { authOptions } from "@/utils/auth/next-auth";
import DashboardContent from "@/(dashboard)/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardContent />;
}
