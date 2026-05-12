import { Databuddy } from "@databuddy/sdk/react";
import type { Metadata } from "next";
import { GeistPixelLine } from "geist/font/pixel";
import { Geist, Geist_Mono, Silkscreen } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistPixelLine = GeistPixelLine;

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://opensec.sh"),
  applicationName: "OpenSec",
  title: {
    default: "OpenSec - Donated Security Reviews for Open Source",
    template: "%s | OpenSec",
  },
  description:
    "Request private security reviews for public GitHub repositories, or donate spare AI usage to help secure open source projects.",
  keywords: [
    "AI security review",
    "open source security",
    "GitHub security",
    "OpenSec",
    "security audit",
    "vulnerability review",
  ],
  authors: [{ name: "OpenSec" }],
  creator: "OpenSec",
  publisher: "OpenSec",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "OpenSec",
    title: "OpenSec - Donated Security Reviews for Open Source",
    description:
      "Request private security reviews for public GitHub repositories, or donate spare AI usage to help secure open source projects.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenSec - Donated Security Reviews for Open Source",
    description:
      "Request private security reviews for public GitHub repositories, or donate spare AI usage to help secure open source projects.",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistPixelLine.variable} ${silkscreen.variable} antialiased`}
      >
        <Databuddy
          clientId="5f523052-bdcd-49da-b8bb-c177190257b3"
          trackErrors
        />
        <Providers>
          <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
            <Header />
            <div aria-hidden="true" className="h-16 shrink-0" />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
