import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
