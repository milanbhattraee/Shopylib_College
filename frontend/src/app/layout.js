import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryClientWrapper from "./provider/QueryClientWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Shopylib – Buy Everything Online",
  description: "Shop the best products online at Shopylib. Discover trending fashion, electronics, home essentials and more.",
  keywords: "online shopping, fashion, electronics, home, Shopylib",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientWrapper>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
        </QueryClientWrapper>
      </body>
    </html>
  );
}
