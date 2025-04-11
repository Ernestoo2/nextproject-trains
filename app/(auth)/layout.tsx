import FooterPage from "../_components/Footer";
import Header1Ui from "../_components/Header/Header1Ui";

export default function AuthLayout({
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
