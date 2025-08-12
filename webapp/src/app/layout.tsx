import type { Metadata } from "next";
import { Alegreya, PT_Sans } from "next/font/google";
import "./globals.css";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "D2 Armor Tomfoolery",
  description: "Analyze your Destiny 2 armor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ptSans.variable} ${alegreya.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
