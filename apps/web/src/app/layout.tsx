import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@blenvi/ui/globals.css";
import { TooltipProvider } from "@blenvi/ui/components/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blenvi",
    template: "%s | Blenvi",
  },
  description: "Blenvi web application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </TooltipProvider>
  );
}
