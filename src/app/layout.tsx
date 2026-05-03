import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Obsidia — The honest backtester for Solana traders",
  description:
    "Bring your strategy. We test it on 5 years of real-fee data, alert you when it fires live, and explain what's happening.",
  metadataBase: new URL("https://obsidia.fi"),
  openGraph: {
    title: "Obsidia",
    description:
      "The honest backtester for Solana traders. Real fees. No lookahead. AI co-pilot.",
    url: "https://obsidia.fi",
    siteName: "Obsidia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidia",
    description: "The honest backtester for Solana traders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
