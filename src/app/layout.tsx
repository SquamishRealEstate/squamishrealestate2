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
  metadataBase: new URL("https://squamish.realestate"),
  title: "Squamish Real Estate | Homes, Condos & MLS® Listings",
  description:
    "Explore Squamish BC real estate: active MLS® listings, market trends, and neighbourhood guides with local agent Sean Brawley PREC*.",
  icons: {
    icon: "/images/icon.ico",
  },
  alternates: {
    canonical: "https://squamish.realestate/",
  },
  openGraph: {
    type: "website",
    url: "https://squamish.realestate/",
    siteName: "Squamish Real Estate",
    title: "Squamish Real Estate & MLS® Listings | Sean Brawley",
    description:
      "Discover mountain view properties, townhomes, and market insights in Squamish, BC.",
    images: [
      {
        url: "/images/landing.jpg",
        width: 1200,
        height: 630,
        alt: "Squamish, British Columbia — mountain view real estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Squamish Real Estate & MLS® Listings | Sean Brawley",
    description:
      "Discover mountain view properties, townhomes, and market insights in Squamish, BC.",
    images: ["/images/landing.jpg"],
  },
};

// Server-rendered structured data (visible to crawlers without JavaScript)
const realEstateAgentJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Sean Brawley PREC*",
  image: "https://squamish.realestate/images/landing.jpg",
  "@id": "https://squamish.realestate/#agent",
  url: "https://squamish.realestate",
  telephone: "+1-604-849-0500",
  email: "sean@squamish.realestate",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Squamish",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  memberOf: {
    "@type": "Organization",
    name: "RE/MAX Masters Realty",
  },
  sameAs: [
    "https://www.facebook.com/sean.squamish.realestate",
    "https://www.instagram.com/sean.squamish.realestate/",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(realEstateAgentJsonLd),
          }}
        />
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
            gtag('config', 'G-3HD0JQTK9F');
          `}
            </Script>
          </MapProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
