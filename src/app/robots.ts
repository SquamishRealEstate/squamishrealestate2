import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://squamish.realestate";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"], // Add any private routes here
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
