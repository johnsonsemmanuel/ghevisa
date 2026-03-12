import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "@/components/ui/layout/cookie-consent";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "GH-eVISA — Ghana Electronic Visa Platform",
  description:
    "Apply for your Ghana Tourism or Business eVisa online. Fast, secure, and transparent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
