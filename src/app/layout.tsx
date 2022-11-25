import "../styles/globals.scss";
import { Header } from "components/Header";
import { Footer } from "components/Footer";
import { Providers } from "@/app/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head />
      <body id="__next">
        <Providers>
          <Header />
          <div className="overflow-y-auto flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
