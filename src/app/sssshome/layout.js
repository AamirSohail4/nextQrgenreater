import "bootstrap/dist/css/bootstrap.min.css";
import "../style/vistorView.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Banner from "@/components/Banner";

export const metadata = {
  title: "QR Genreater",
  description: "Genreater",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Banner />
        <main className="container_layout">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
