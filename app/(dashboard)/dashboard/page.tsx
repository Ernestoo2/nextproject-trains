import { authOptions } from "@/utils/auth/next-auth";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardContent from "../page";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardContent />;
}
