import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripMind AI - AI-Powered Personal Travel Planner",
  description: "Generate customized, budget-optimized travel itineraries in seconds using advanced AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid #27272a",
            },
          }} 
        />
      </body>
    </html>
  );
}
