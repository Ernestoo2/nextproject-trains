// app/(dashboard)/layout.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/auth/next-auth";
import Header1Ui from "../_components/Header/Header1Ui";
import FooterPage from "../_components/Footer";

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
      <Header1Ui />
      <main className="">{children}</main>
      <FooterPage />
    </div>
  );
}
