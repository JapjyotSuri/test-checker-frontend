import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: {
    default: "Ca Prep Series | caprepseries - Online CA Test Series Platform",
    template: "%s | Ca Prep Series",
  },
  description:
    "Ca Prep Series (caprepseries) – India's trusted online test series platform for CA Foundation, Intermediate & Final exam preparation. Practice with expert-curated tests, get instant results & boost your CA scores.",
  keywords: [
    "caprepseries",
    "ca prep series",
    "CA test series",
    "CA Foundation test series",
    "CA Intermediate test series",
    "CA Final test series",
    "chartered accountant preparation",
    "CA exam practice",
    "online CA tests",
    "CA mock tests",
  ],
  metadataBase: new URL("https://vps.caprepseries.in"),
  alternates: {
    canonical: "https://vps.caprepseries.in",
  },
  openGraph: {
    title: "Ca Prep Series | caprepseries - Online CA Test Series Platform",
    description:
      "India's trusted online test series platform for CA Foundation, Intermediate & Final exam preparation.",
    url: "https://vps.caprepseries.in",
    siteName: "Ca Prep Series",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ca Prep Series | caprepseries",
    description:
      "Practice CA Foundation, Inter & Final tests online. Expert-curated test series for chartered accountant exam preparation.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
