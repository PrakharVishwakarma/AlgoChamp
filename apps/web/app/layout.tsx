import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";
import { JSX } from "react";
import { FlashMessageContainer } from "../components/common/FlashMessageContainer";
import { ThemeScript } from "../components/theme/ThemeScript";

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen transition-colors duration-300`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <FlashMessageContainer />
        </Providers>
      </body>
    </html>
  );
}