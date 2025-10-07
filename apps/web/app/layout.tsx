import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";
import { JSX } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlgoChamp - Competitive Programming Platform",
  description: "Master algorithms and data structures with our competitive programming platform",
  keywords: ["algorithms", "competitive programming", "coding", "data structures"],
  authors: [{ name: "AlgoChamp Team" }],
  openGraph: {
    title: "AlgoChamp - Competitive Programming Platform",
    description: "Master algorithms and data structures with our competitive programming platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="scroll-smooth">
      <Providers>
        <body className={`${inter.className} antialiased bg-slate-950 text-white min-h-screen`}>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </body>
      </Providers>
    </html>
  );
}