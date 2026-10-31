import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Kitchen & Baking Converter — Cups to Grams, Oven Temps & Volumes",
  description:
    "Free one-tap converter for bakers: cups to grams for 60+ ingredients, oven temperature °F/°C/Gas Mark, and volume conversions (fl oz, cups, mL, liters) for US & Imperial measures. Save your favorite conversions.",
  keywords: [
    "cups to grams",
    "baking conversion",
    "oven temperature converter",
    "gas mark",
    "fl oz to ml",
    "kitchen converter",
    "recipe conversion",
  ],
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kitchen Conv",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Kitchen & Baking Converter",
    description: "Cups to grams, oven temps and volumes — precise one-tap conversions for bakers.",
    siteName: "Kitchen & Baking Converter",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#2a2320" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Register the SW from the very first HTML parse — PWABuilder and
            install prompts detect it without waiting for hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js").catch(function(){})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
