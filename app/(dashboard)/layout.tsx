import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/utils/auth/next-auth";
import HeaderPage from "@/app/_components/Header/page";
import FooterPage from "@/app/_components/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPage />
      <main className="flex-grow">{children}</main>
      <FooterPage />
    </div>
  );
}
