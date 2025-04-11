// app/(dashboard)/layout.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import FooterPage from "../_components/Footer";
import HeaderPage from "../_components/Header/page";
import { authOptions } from "@/app/utils/auth/next-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="">
      <HeaderPage />
      <main className="">{children}</main>
      <FooterPage />
    </div>
  );
}
