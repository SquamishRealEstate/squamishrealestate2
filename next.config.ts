import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/privacyStatement",
        destination: "/privacy-statement",
        permanent: true,
      },
    ];
  },
  images: {
    // WebP only: AVIF would double the transformation cardinality across
    // ~250k unique MLS/listing images, and transformations are the
    // scarce metered resource on our hosting plan.
    formats: ["image/webp"],
    // Photo URLs are unique per photo (content-immutable), so a long
    // browser cache TTL is safe and cuts repeat optimizer hits.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "mxafchaojljgapdzatra.supabase.co",
      },
      {
        protocol: "https",
        hostname: "dvvjkgh94f2v6.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "cdnparap130.paragonrels.com",
      },
    ],
  },
};

export default nextConfig;
