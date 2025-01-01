import "bootstrap/dist/css/bootstrap.min.css";
import "./[strCode]/style/validater.css";

export const metadata = {
  title: "QR Validate",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
