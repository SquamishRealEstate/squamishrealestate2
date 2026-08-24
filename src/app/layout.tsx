import type { Metadata } from "next";
import "./globals.css";
import { Outfit, Inter, Space_Grotesk } from "next/font/google";
import { MapProvider } from "@/components/context/MapContext";
import { AuthProvider } from "@/components/context/AuthProvider";
import ConsoleLoggerSilencer from "@/components/context/ConsoleLoggerSilencer";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Squamish Real Estate",
  description:
    "Discover mountain view properties, modern townhomes, and luxury estates in BC’s outdoor paradise.",
  icons: {
    icon: "/images/icon.ico",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${spaceGrotesk.variable}`}
      >
        <AuthProvider>
          <MapProvider>
            <ConsoleLoggerSilencer />
            {children}

            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-6PC9DFB2SQ"
              strategy="afterInteractive"
            />
            <Script id="google-tags" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6PC9DFB2SQ');
            gtag('config', 'AW-1071980077');
          `}
            </Script>
          </MapProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
