import Header1Ui from "../../_components/Header/Header1Ui";
import FooterPage from "../../_components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <Header1Ui />
      <main className="">{children}</main>
      <FooterPage />
    </div>
  );


}
