import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Courier Income Decision Dashboard",
  description: "Find the best stable, non-CDL courier and route driver jobs near Baltimore, MD / ZIP 21237.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 overflow-x-hidden">
        <Navigation>
          {children}
        </Navigation>
      </body>
    </html>
  );
}

