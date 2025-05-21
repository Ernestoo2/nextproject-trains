import FooterPage from "../../_components/Footer";
import Header1Ui from "../../_components/Header/Header1Ui";
export const dynamic = 'force-dynamic';

export default function TrainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header1Ui />
      <main className="">{children}</main>
      <FooterPage />
    </div>
  );
}
